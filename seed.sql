-- Insert Payment Methods
INSERT INTO payment_methods (code, label) VALUES
('cash', 'Cash'),
('qris', 'QRIS'),
('debit', 'Debit');

-- Insert Facilities
INSERT INTO facilities (code, label, icon) VALUES
('wifi', 'Wi-Fi', '🛜'),
('toilet', 'Toilet', '🚻'),
('mushola', 'Mushola', '🕌'),
('cat-friendly', 'Cat Friendly', '🐱'),
('music', 'Music', '🎵'),
('ac', 'AC', '❄️'),
('playground', 'Playground', '🎮'),
('meeting-room', 'Meeting Room', '🏢'),
('smoking-area', 'Smoking Area', '🚬'),
('board-games', 'Board Games', '🎲');

-- Insert Cafes
INSERT INTO cafes (slug, name, address, latitude, longitude, google_maps_url, instagram_url, instagram_username, parking)
VALUES
('blanco-coffee-books', 'Blanco Coffee & Books', 'Jl. Kranggan No.30, Jetis, Yogyakarta', -7.7956, 110.3695, 'https://maps.app.goo.gl/zVxTkqYWzybtReNQ07', 'https://instagram.com/blancocoffeeid', '@blancocoffeeid', 'Motor, Mobil');

-- Insert Opening Hours (09:00 - 23:00 setiap hari)
INSERT INTO opening_hours (cafe_id, day_of_week, open_time, close_time, is_closed) 
VALUES 
(1, 'Monday', '09:00:00', '23:00:00', 0),
(1, 'Tuesday', '09:00:00', '23:00:00', 0),
(1, 'Wednesday', '09:00:00', '23:00:00', 0),
(1, 'Thursday', '09:00:00', '23:00:00', 0),
(1, 'Friday', '09:00:00', '23:00:00', 0),
(1, 'Saturday', '09:00:00', '23:00:00', 0),
(1, 'Sunday', '09:00:00', '23:00:00', 0);

-- Insert Cafe Payment Methods
INSERT INTO cafe_payment_methods (cafe_id, payment_method_id)
VALUES
(1, 1),
(1, 2),
(1, 3);

-- Insert Cafe Facilities (Wi-Fi, Toilet, Mushola for Blanco)
INSERT INTO cafe_facilities (cafe_id, facility_id)
VALUES
(1, 1),  -- Wi-Fi
(1, 2),  -- Toilet
(1, 3);  -- Mushola

-- Insert Cafe Images
INSERT INTO cafe_images (cafe_id, image_url, alt)
VALUES
(1, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', 'Blanco Coffee & Books - Main'),
(1, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', 'Blanco Coffee & Books - Interior 1'),
(1, 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400', 'Blanco Coffee & Books - Interior 2'),
(1, 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400', 'Blanco Coffee & Books - Menu');

-- Update main_image_id for cafes
UPDATE cafes SET main_image_id = 1 WHERE id = 1;
