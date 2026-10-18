# SnapShare Scaling Plan

## Assumptions

- SnapShare has 10 million registered users, and 10% are active on an average day.
- Each daily active user uploads one photo and requests 50 feed pages per day.
- An original photo averages 2 MB, and each photo has one 50 KB thumbnail.
- A day has 86,400 seconds and a year has 365 days.
- Storage uses decimal units (1 GB = 1,000 MB; 1 TB = 1,000 GB). The estimate assumes every photo and thumbnail is retained for the full year, with no compression, deletion, or storage-replication overhead.
- Upload and feed request rates below are averages across a full day; peak feed traffic is estimated at five times its average. Metadata and other database records are small compared with the photo files.

## Daily users and traffic estimates

Daily active users:

```text
10,000,000 registered users × 10% active = 1,000,000 daily active users
```

| Measure | Calculation | Estimate |
| --- | --- | ---: |
| Photo uploads per day | 1,000,000 users × 1 upload | 1,000,000 |
| Average uploads per second | 1,000,000 ÷ 86,400 | 11.6 |
| Feed page views per day | 1,000,000 users × 50 pages | 50,000,000 |
| Average feed views per second | 50,000,000 ÷ 86,400 | 579 |
| Peak feed views per second | 579 × 5 | 2,895 |

The average upload rate is about 12 uploads per second; real traffic will vary over the day, so the upload service should scale beyond that average.

## Photo storage per year

```text
Originals:   1,000,000 photos/day × 2 MB × 365 days = 730,000,000 MB = 730 TB/year
Thumbnails:  1,000,000 photos/day × 50 KB × 365 days = 18,250 GB = 18.25 TB/year
Total:       730 TB + 18.25 TB = 748.25 TB/year
```

This is the raw, unreplicated storage for one year of uploads, including thumbnails. Database metadata is excluded; backups, replicas, growth in file sizes, and retention beyond one year would increase the provisioned capacity.

## Workload shape and storage choice

SnapShare is **read-heavy** by request count: it serves about 50 feed-page requests for each photo upload, and the busiest read periods are estimated at nearly 2,900 feed views per second. The design therefore caches frequently requested feed data and lets a CDN serve photo files close to viewers, while scaling app servers and read capacity for feed requests; writes still need a durable upload path and asynchronous thumbnail processing.

Photo files should not be stored as database blobs: at roughly 748 TB of new image data per year, they would inflate database storage and backups and make database reads, writes, and scaling more expensive. Store originals and thumbnails in durable object storage, and keep only metadata and object keys/URLs in the database.

## Architecture

```text
 +--------+   API/feed    +---------------+   +-------------+
 | Client |------------->| Load balancer |-->| App servers |
 +---+----+              +---------------+   +--+---+---+--+
     |                                          |   |   |
     | presigned upload                         |   |   +---- read/write ----+
     v                                          |   |                        v
 +---+------------------+                       |   |                 +------+--------+
 | Object storage       |<----------------------+   |                 | Database     |
 | originals + thumbs   |  worker reads/writes      |                 | primary      |
 +---+------------------+                           |                 +------+--------+
     ^                                              |                        | replicate
     | cache miss                                   v                        v
 +---+----+   photo delivery                 +------+----+          +--------+-------+
 |  CDN   |<--------------------+             |  Cache   |          | Read replica   |
 +---+----+                     |             +-----------+          +----------------+
     ^                          |
     +--------------------------+
                Client

 App servers ---- enqueue thumbnail job ----> +-------+   job   +-------------------+
                                               | Queue |------->| Thumbnail worker  |
                                               +-------+        +---------+---------+
                                                                        |
                                                   read original/write thumbnail
                                                                        |
                                                                        v
                                                               Object storage
```

## Components

- **Load balancer:** Distributes incoming API and feed requests across healthy app servers so no single server becomes a bottleneck.
- **App servers:** Authenticate users, coordinate upload authorization and feed responses, and write photo metadata without processing large image files inline.
- **Cache:** Keeps hot feed data and frequently accessed metadata in fast storage to reduce repeated database reads and improve feed response times.
- **Database primary:** Stores durable photo metadata, ownership, and feed-related records and accepts application writes.
- **Database read replica:** Serves read-only feed and metadata queries to increase read capacity while replication keeps it updated from the primary.
- **Object storage:** Holds the large original image and generated thumbnail files durably and independently of the relational database.
- **Queue:** Buffers thumbnail-generation jobs so upload requests can complete without waiting for image processing and workers can process bursts asynchronously.
- **Thumbnail worker:** Consumes queued jobs, reads originals from object storage, creates appropriately sized thumbnails, writes them back to object storage, and records their metadata.
- **CDN:** Caches and delivers photo files from locations near viewers, reducing latency and origin-object-storage traffic.

## Photo upload flow

1. The client asks an app server to start an upload; the server authenticates the user, checks upload limits, and creates a photo record in a pending state.
2. The app server returns a short-lived, photo-specific presigned upload URL so the client can send the file directly to object storage rather than proxying the 2 MB file through an app server.
3. The client uploads the original photo to the designated object-storage location using that URL.
4. After a successful upload, the client notifies the app server; the server verifies the object exists, records its key and status in the database, and enqueues a thumbnail job.
5. A thumbnail worker consumes the job, fetches the original from object storage, generates a 50 KB thumbnail, and stores it as a separate object.
6. The worker updates the photo metadata to mark the thumbnail ready; the app can then include the photo in feeds with CDN URLs for the original and thumbnail.
7. When someone views a feed, app servers retrieve feed metadata from the cache or read replica, and the client fetches the image files through the CDN.

## Trade-offs

- **Direct-to-object-storage uploads vs. proxying through app servers:** Presigned uploads save app-server bandwidth and make upload capacity easier to scale, but require careful URL expiration, access control, and handling of clients that abandon an upload.
- **Asynchronous thumbnails vs. generating them during the upload request:** A queue keeps upload responses fast and absorbs bursts, but a photo may not have a thumbnail immediately, so the product needs a pending state or a fallback until the job finishes.
- **Read replicas and cache vs. reading every request from the primary:** They improve feed throughput and reduce primary-database load, but replica lag and stale cache entries can briefly make recent uploads or feed changes less visible.
- **CDN caching vs. always fetching from object storage:** A CDN reduces latency and origin load, but cached content can take time to invalidate after a change, and cache misses still reach object storage.
