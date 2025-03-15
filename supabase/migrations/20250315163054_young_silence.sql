/*
  # Add Test Suppliers

  1. New Data
    - Adds 20 test suppliers with random names
    - Sets basic contact information
    - Includes example addresses
    
  2. Notes
    - Supplier numbers will be auto-generated
    - Each supplier gets one default billing address
*/

-- Insert test suppliers
INSERT INTO suppliers (name, email, phone, website, notes)
VALUES 
  ('Nordic Textiles AB', 'info@nordictextiles.se', '+46 8 123 45 67', 'www.nordictextiles.se', 'Major Swedish textile supplier'),
  ('Fashion Direct GmbH', 'kontakt@fashiondirect.de', '+49 30 987 65 43', 'www.fashiondirect.de', 'German fashion wholesaler'),
  ('Milano Fabrics S.p.A.', 'info@milanofabrics.it', '+39 02 345 67 89', 'www.milanofabrics.it', 'Italian luxury fabrics'),
  ('Paris Mode SARL', 'contact@parismode.fr', '+33 1 23 45 67 89', 'www.parismode.fr', 'French fashion distributor'),
  ('London Textile Trading Ltd', 'sales@londontextile.co.uk', '+44 20 7123 4567', 'www.londontextile.co.uk', 'UK-based textile trader'),
  ('Amsterdam Apparel BV', 'info@amsterdamapparel.nl', '+31 20 123 4567', 'www.amsterdamapparel.nl', 'Dutch clothing supplier'),
  ('Copenhagen Design Co', 'sales@copenhagendesign.dk', '+45 33 12 34 56', 'www.copenhagendesign.dk', 'Danish design house'),
  ('Oslo Fashion AS', 'post@oslofashion.no', '+47 22 12 34 56', 'www.oslofashion.no', 'Norwegian fashion wholesaler'),
  ('Helsinki Textiles Oy', 'info@helsinkitextiles.fi', '+358 9 123 4567', 'www.helsinkitextiles.fi', 'Finnish textile manufacturer'),
  ('Barcelona Style SL', 'info@barcelonastyle.es', '+34 93 123 45 67', 'www.barcelonastyle.es', 'Spanish fashion distributor'),
  ('Porto Fabrics Lda', 'info@portofabrics.pt', '+351 22 123 4567', 'www.portofabrics.pt', 'Portuguese fabric supplier'),
  ('Athens Fashion SA', 'info@athensfashion.gr', '+30 21 0123 4567', 'www.athensfashion.gr', 'Greek fashion wholesaler'),
  ('Vienna Textiles GmbH', 'office@viennatextiles.at', '+43 1 123 45 67', 'www.viennatextiles.at', 'Austrian textile supplier'),
  ('Brussels Mode SPRL', 'info@brusselsmode.be', '+32 2 123 45 67', 'www.brusselsmode.be', 'Belgian fashion distributor'),
  ('Warsaw Textiles Sp. z o.o.', 'biuro@warsawtextiles.pl', '+48 22 123 45 67', 'www.warsawtextiles.pl', 'Polish textile trader'),
  ('Prague Fashion s.r.o.', 'info@praguefashion.cz', '+420 2 12 34 56 78', 'www.praguefashion.cz', 'Czech fashion supplier'),
  ('Budapest Style Kft', 'info@budapestyle.hu', '+36 1 123 4567', 'www.budapestyle.hu', 'Hungarian fashion distributor'),
  ('Dublin Textiles Ltd', 'info@dublintextiles.ie', '+353 1 123 4567', 'www.dublintextiles.ie', 'Irish textile supplier'),
  ('Zurich Fashion AG', 'info@zurichfashion.ch', '+41 44 123 45 67', 'www.zurichfashion.ch', 'Swiss fashion wholesaler'),
  ('Luxembourg Mode Sarl', 'info@luxembourgmode.lu', '+352 123 456', 'www.luxembourgmode.lu', 'Luxembourg fashion distributor');

-- Add example addresses
INSERT INTO addresses (supplier_id, type, street, city, country, is_default)
SELECT 
  s.id,
  'billing',
  'Main Street ' || floor(random() * 100 + 1)::text,
  split_part(s.email, '@', 2),
  substring(split_part(s.email, '.', -1) from 1 for 2),
  true
FROM suppliers s
WHERE s.email IS NOT NULL;