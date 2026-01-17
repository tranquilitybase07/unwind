# Emoji Handling in Categories

## Issue
The original migration file had UTF-8 encoding issues with emoji characters, causing this error:
```
ERROR: invalid byte sequence for encoding "UTF8": 0xa1
```

## Solution
Replaced actual emoji Unicode characters with ASCII-safe text placeholders:

| Category | Placeholder | Actual Emoji (to add later) |
|----------|-------------|----------------------------|
| Tasks | `check` | ✓ |
| Ideas | `lightbulb` | 💡 |
| Errands | `cart` | 🛒 |
| Health | `heart` | ❤️ |
| Relationships | `people` | 👥 |
| Worries Vault | `lock` | 🔒 |
| Recurring | `repeat` | 🔄 |

## Adding Actual Emojis Later

You can update the emojis after the migration runs using either:

### Option 1: SQL Update
```sql
UPDATE categories SET emoji = '✓' WHERE name = 'Tasks';
UPDATE categories SET emoji = '💡' WHERE name = 'Ideas';
UPDATE categories SET emoji = '🛒' WHERE name = 'Errands';
UPDATE categories SET emoji = '❤️' WHERE name = 'Health';
UPDATE categories SET emoji = '👥' WHERE name = 'Relationships';
UPDATE categories SET emoji = '🔒' WHERE name = 'Worries Vault';
UPDATE categories SET emoji = '🔄' WHERE name = 'Recurring';
```

### Option 2: Via Your App
Update the emojis programmatically when your app initializes or through an admin interface.

### Option 3: New Migration
Create a new migration file:
```bash
supabase migration new update_category_emojis
```

Then add the UPDATE statements above to that migration file.

## Why This Happened
SQL migration files can have encoding issues when:
1. The terminal/shell encoding doesn't match UTF-8
2. The file is created via heredoc in bash
3. Copy-pasting from certain editors

Using ASCII placeholders ensures the migration always works regardless of encoding settings.
