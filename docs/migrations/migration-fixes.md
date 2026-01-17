# Migration File Fixes

## Issues Fixed in the Migration

### 1. **Index Declaration Syntax**
**Problem:** PostgreSQL doesn't support inline `INDEX` declarations inside `CREATE TABLE` statements.

**Original (Incorrect):**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  INDEX idx_email (email)  -- ❌ Invalid syntax
);
```

**Fixed:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE INDEX idx_email ON users(email);  -- ✅ Correct
```

### 2. **Function Syntax Errors**
**Problem:** Multiplication operators were using underscore `_` instead of asterisk `*`.

**Original (Incorrect):**
```sql
NEW.final_priority_score := (
  (NEW.urgency_score _ 0.4) +  -- ❌ Invalid operator
  (NEW.importance_score _ 0.4) +
  (NEW.emotional_weight_score * 0.2)
)::INTEGER;
```

**Fixed:**
```sql
NEW.final_priority_score := (
  (NEW.urgency_score * 0.4) +  -- ✅ Correct
  (NEW.importance_score * 0.4) +
  (NEW.emotional_weight_score * 0.2)
)::INTEGER;
```

### 3. **View Aggregation with NULL Values**
**Problem:** `ARRAY_AGG()` includes NULL values by default, which can cause issues.

**Original:**
```sql
ARRAY_AGG(it.tag) as tags
```

**Fixed:**
```sql
ARRAY_AGG(it.tag) FILTER (WHERE it.tag IS NOT NULL) as tags
```

### 4. **Removed Invalid Closing Tag**
**Problem:** The file ended with `$$` which was a leftover markdown code fence.

**Fixed:** Removed the closing `$$` and replaced with proper SQL comments.

## Migration File Location

The corrected migration is now at:
```
supabase/migrations/20260117075200_initial_schema.sql
```

## Next Steps

To apply this migration:

```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db reset

# Or push to remote
supabase db push
```

## Schema Overview

The migration creates:
- **12 tables** (users, categories, items, voice_dumps, etc.)
- **3 views** (user_today_view, user_this_week_view, user_worries_vault_view)
- **2 triggers** (priority calculation, dump count increment)
- **Row Level Security policies** for all user data tables
- **Indexes** optimized for query performance

All syntax is now PostgreSQL-compliant and ready for Supabase.
