USE courses_db;

CREATE TABLE `teachers` (
  `teacher_id` int PRIMARY KEY AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(50),
  `address` text,
  `birth_date` date,
  `start_date` date NOT NULL
);

CREATE TABLE `groups` (
  `group_id` int PRIMARY KEY AUTO_INCREMENT,
  `group_name` varchar(100) NOT NULL,
  `specialty` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `students_count` int NOT NULL
);

CREATE TABLE `disciplines` (
  `discipline_id` int PRIMARY KEY AUTO_INCREMENT,
  `discipline_name` varchar(255) NOT NULL
);

CREATE TABLE `class_types` (
  `type_id` int PRIMARY KEY AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL
);

CREATE TABLE `teacher_disciplines` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `teacher_id` int,
  `discipline_id` int
);

CREATE TABLE `payment_rates` (
  `rate_id` int PRIMARY KEY AUTO_INCREMENT,
  `discipline_id` int,
  `type_id` int,
  `min_experience` int NOT NULL,
  `max_experience` int,
  `rate_per_hour` decimal(10,2) NOT NULL
);

CREATE TABLE `workloads` (
  `workload_id` int PRIMARY KEY AUTO_INCREMENT,
  `teacher_id` int,
  `group_id` int,
  `discipline_id` int,
  `type_id` int,
  `hours_taught` int NOT NULL,
  `date_assigned` date NOT NULL
);

CREATE TABLE `curriculum` (
  `curriculum_id` int PRIMARY KEY AUTO_INCREMENT,
  `discipline_id` int,
  `type_id` int,
  `planned_hours` int NOT NULL
);

ALTER TABLE `teacher_disciplines` ADD FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`);
ALTER TABLE `teacher_disciplines` ADD FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`discipline_id`);
ALTER TABLE `payment_rates` ADD FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`discipline_id`);
ALTER TABLE `payment_rates` ADD FOREIGN KEY (`type_id`) REFERENCES `class_types` (`type_id`);
ALTER TABLE `workloads` ADD FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`);
ALTER TABLE `workloads` ADD FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`);
ALTER TABLE `workloads` ADD FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`discipline_id`);
ALTER TABLE `workloads` ADD FOREIGN KEY (`type_id`) REFERENCES `class_types` (`type_id`);
ALTER TABLE `curriculum` ADD FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`discipline_id`);
ALTER TABLE `curriculum` ADD FOREIGN KEY (`type_id`) REFERENCES `class_types` (`type_id`);
