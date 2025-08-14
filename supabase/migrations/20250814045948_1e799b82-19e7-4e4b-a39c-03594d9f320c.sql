-- Add the missing learner with email from session replay
INSERT INTO learners (name, email, status, team, role, requires_password_change) 
VALUES ('Fiona', 'azcreative@gmail.com', 'active', 'Team A', 'Learner', false);