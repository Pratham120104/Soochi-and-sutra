-- SQL queries to alter the measurements table to add new fields

-- Add armhole loose left and right fields
ALTER TABLE `measurements` 
ADD COLUMN `armhole_loose_left` varchar(20) DEFAULT NULL AFTER `armhole_loose`,
ADD COLUMN `armhole_loose_right` varchar(20) DEFAULT NULL AFTER `armhole_loose_left`;

-- Add hand loose above elbow left and right fields
ALTER TABLE `measurements` 
ADD COLUMN `hand_loose_above_elbow_left` varchar(20) DEFAULT NULL AFTER `hand_loose_above_elbow`,
ADD COLUMN `hand_loose_above_elbow_right` varchar(20) DEFAULT NULL AFTER `hand_loose_above_elbow_left`;

-- Add hand loose below elbow left and right fields
ALTER TABLE `measurements` 
ADD COLUMN `hand_loose_below_elbow_left` varchar(20) DEFAULT NULL AFTER `hand_loose_below_elbow`,
ADD COLUMN `hand_loose_below_elbow_right` varchar(20) DEFAULT NULL AFTER `hand_loose_below_elbow_left`;

-- Add lehenga length and waist length fields
ALTER TABLE `measurements` 
ADD COLUMN `lehenga_length` varchar(20) DEFAULT NULL AFTER `waist_loose`,
ADD COLUMN `waist_length` varchar(20) DEFAULT NULL AFTER `lehenga_length`;