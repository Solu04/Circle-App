-- Seed data for initial communities and challenges
-- Run this after the main schema is created

-- Insert sample communities
INSERT INTO public.communities (id, name, description, image_url, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Tech Innovators', 'A community for developers, designers, and tech enthusiasts to share their latest projects and innovations.', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400', true),
('550e8400-e29b-41d4-a716-446655440002', 'Creative Arts', 'Artists, musicians, writers, and creators showcasing their artistic journey and creative challenges.', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true),
('550e8400-e29b-41d4-a716-446655440003', 'Fitness & Wellness', 'Health enthusiasts sharing workout routines, nutrition tips, and wellness challenges.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', true),
('550e8400-e29b-41d4-a716-446655440004', 'Cooking & Food', 'Food lovers, chefs, and home cooks sharing recipes, cooking techniques, and culinary adventures.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true),
('550e8400-e29b-41d4-a716-446655440005', 'Gaming Community', 'Gamers sharing gameplay, reviews, tutorials, and gaming challenges across all platforms.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', true);

-- Sample weekly challenges for each community
-- Tech Innovators challenges
INSERT INTO public.challenges (id, community_id, title, description, status, start_date, end_date) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Build a Mini App in 24 Hours', 'Create a functional web or mobile app within 24 hours. Show your development process, challenges faced, and the final result. Any technology stack is welcome!', 'active', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Code Review & Optimization', 'Take an existing piece of code (yours or open source) and demonstrate how to optimize it for better performance, readability, or maintainability.', 'draft', NOW() + INTERVAL '5 days', NOW() + INTERVAL '12 days');

-- Creative Arts challenges
INSERT INTO public.challenges (id, community_id, title, description, status, start_date, end_date) VALUES
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Digital Art Speed Paint', 'Create a digital artwork from concept to completion in one sitting. Share your creative process, techniques, and inspiration behind the piece.', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Music Production Challenge', 'Compose and produce an original track in any genre. Show your production process, from initial idea to final mix.', 'draft', NOW() + INTERVAL '6 days', NOW() + INTERVAL '13 days');

-- Fitness & Wellness challenges
INSERT INTO public.challenges (id, community_id, title, description, status, start_date, end_date) VALUES
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '30-Minute Home Workout', 'Design and demonstrate a complete 30-minute workout that can be done at home with minimal equipment. Focus on form, progression, and modifications.', 'active', NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Healthy Meal Prep Sunday', 'Plan and prepare a week''s worth of healthy meals. Share your planning process, shopping tips, and meal prep techniques.', 'draft', NOW() + INTERVAL '4 days', NOW() + INTERVAL '11 days');

-- Cooking & Food challenges
INSERT INTO public.challenges (id, community_id, title, description, status, start_date, end_date) VALUES
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'Mystery Ingredient Challenge', 'Create a delicious dish using a mystery ingredient (to be revealed). Show your thought process, cooking techniques, and final presentation.', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'Baking Fundamentals', 'Demonstrate a fundamental baking technique (bread making, pastry, etc.) and share tips for beginners. Focus on technique and troubleshooting.', 'draft', NOW() + INTERVAL '6 days', NOW() + INTERVAL '13 days');

-- Gaming Community challenges
INSERT INTO public.challenges (id, community_id, title, description, status, start_date, end_date) VALUES
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'Speedrun Tutorial', 'Choose a game and create a tutorial for a speedrun category. Explain strategies, glitches, and techniques that help achieve faster times.', 'active', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'Game Review & Analysis', 'Provide an in-depth review and analysis of a recently released game. Cover gameplay, story, graphics, and overall experience.', 'draft', NOW() + INTERVAL '5 days', NOW() + INTERVAL '12 days');

