-- Ajouter les colonnes manquantes à wf_users
ALTER TABLE wf_users
ADD COLUMN IF NOT EXISTS venue_id TEXT,
ADD COLUMN IF NOT EXISTS venue_name TEXT;

-- Mettre à jour l'utilisateur existant avec des valeurs par défaut
UPDATE wf_users
SET venue_id = 'saint-placide',
    venue_name = 'The Saint Placide'
WHERE venue_id IS NULL OR venue_name IS NULL;