# School Database Design

## Tables

- **students** stores each student's ID, name, and email. The ID is the primary key, and email is required and unique so a student cannot be entered twice with the same email.
- **courses** stores each course's ID and required name. The course ID is the primary key, and the name is unique.
- **enrolments** records the fact that a student takes a course and the grade for that enrolment. Its `student_id` and `course_id` are foreign keys. Together, they form the primary key, which prevents the same student from enrolling on the same course twice. A grade is required and constrained to 0–100.

## Relationships

One student can have many enrolments, and one course can have many enrolments; each enrolment belongs to one student and one course. Students and courses therefore have a many-to-many relationship: a student may take several courses, and a course may have several students. The `enrolments` join table is needed to represent that relationship, connect the two tables with foreign keys, prevent duplicate student-course pairs, and store a grade for each pair.

## Index

The schema adds an index on `enrolments.course_id`. The composite primary key starts with `student_id`, so it is useful for student-based lookups but does not efficiently support lookups by course. An index on `course_id` helps retrieve the students on a course and calculate enrolment counts.

## SQL or NoSQL?

I would choose a relational SQL database for this system. Students, courses, and enrolments have clear relationships, and enrolments must refer to valid students and courses while preventing duplicate registrations. Foreign keys, uniqueness constraints, and transactions make those rules reliable, and joins make the requested reports straightforward. A document database could work, but it would require more application-level handling to keep these relationships and constraints consistent.
