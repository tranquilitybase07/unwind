import { createClient } from '@supabase/supabase-js'

// This script tests your Supabase connection and database schema
async function testDatabase() {
  console.log('🔍 Testing Supabase Connection...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey)
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test 1: Check if voice_dumps table exists
  console.log('📊 Test 1: Checking voice_dumps table...')
  const { data: tables, error: tableError } = await supabase
    .from('voice_dumps')
    .select('*')
    .limit(0)

  if (tableError) {
    console.error('❌ voice_dumps table error:', tableError.message)
    console.error('Details:', tableError)
  } else {
    console.log('✅ voice_dumps table exists and is accessible\n')
  }

  // Test 2: Check current user (if any)
  console.log('👤 Test 2: Checking authentication...')
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.log('⚠️  No authenticated user (this is okay for testing)')
    console.log('You need to sign in at: http://localhost:3000/auth/login\n')
  } else {
    console.log('✅ User authenticated:', user.email)
    console.log('User ID:', user.id, '\n')

    // Test 3: Try to fetch user's voice dumps
    console.log('📝 Test 3: Fetching voice dumps for current user...')
    const { data: dumps, error: dumpError } = await supabase
      .from('voice_dumps')
      .select('*')
      .eq('user_id', user.id)

    if (dumpError) {
      console.error('❌ Error fetching voice dumps:', dumpError.message)
    } else {
      console.log(`✅ Found ${dumps?.length || 0} voice dumps`)
      if (dumps && dumps.length > 0) {
        console.log('\nRecent dumps:')
        dumps.slice(0, 3).forEach((dump: any) => {
          console.log(`  - ${dump.created_at}: ${dump.transcription.substring(0, 50)}...`)
        })
      }
    }
  }

  // Test 4: Check users table
  console.log('\n👥 Test 4: Checking users table...')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email')
    .limit(5)

  if (usersError) {
    console.error('❌ users table error:', usersError.message)
  } else {
    console.log(`✅ users table exists with ${users?.length || 0} users shown`)
  }

  console.log('\n✨ Database test complete!')
}

testDatabase().catch(console.error)
