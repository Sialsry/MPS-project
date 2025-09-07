import 'dotenv/config';
import { db } from '../src/db/client';
import { companies, musics, music_plays, company_subscriptions, monthly_music_rewards, music_categories } from '../src/db/schema';
import * as crypto from 'crypto';

// API 키 해시화 함수
function hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// 더미 회사 데이터
const dummyCompanies = [
    {
        name: '테스트 프리 컴퍼니',
        business_number: '123-45-67890',
        email: 'free@test.com',
        password_hash: '$2b$10$example.hash.for.password123',
        phone: '010-1234-5678',
        grade: 'free' as const,
        ceo_name: '김프리',
        profile_image_url: 'https://example.com/profile1.jpg',
        homepage_url: 'https://freecompany.com',
        api_key_hash: hashApiKey('free_test_api_key_64_characters_long_string_for_testing_purpose'),
        total_rewards_earned: '0',
        total_rewards_used: '0',
    },
    {
        name: '스탠다드 미디어',
        business_number: '234-56-78901',
        email: 'standard@test.com',
        password_hash: '$2b$10$example.hash.for.password456',
        phone: '010-2345-6789',
        grade: 'standard' as const,
        ceo_name: '박스탠다드',
        profile_image_url: 'https://example.com/profile2.jpg',
        homepage_url: 'https://standardmedia.com',
        api_key_hash: hashApiKey('standard_test_api_key_64_characters_long_string_for_testing'),
        total_rewards_earned: '25000',
        total_rewards_used: '5000',
    },
    {
        name: '비즈니스 엔터테인먼트',
        business_number: '345-67-89012',
        email: 'business@test.com',
        password_hash: '$2b$10$example.hash.for.password789',
        phone: '010-3456-7890',
        grade: 'business' as const,
        ceo_name: '이비즈니스',
        profile_image_url: 'https://example.com/profile3.jpg',
        homepage_url: 'https://biznessent.com',
        api_key_hash: hashApiKey('business_test_api_key_64_characters_long_string_for_testing'),
        total_rewards_earned: '150000',
        total_rewards_used: '30000',
    }
];

// 더미 음악 카테고리 데이터 (스키마상 name 컬럼만 존재)
const dummyCategories = [
    { name: '팝' },
    { name: '발라드' },
    { name: '핍합' },
    { name: '록' },
    { name: 'EDM' },
    { name: '재즈' },
    { name: '클래식' }
];

// 더미 음원 데이터
const dummyMusics = [
    {
        file_path: 'sample1.mp3',
        title: '테스트 발라드',
        artist: '김가수',
        composer: '박작곡가',
        music_arranger: '이편곡가',
        lyricist: '최작사가',
        lyrics_text: '이것은 테스트 가사입니다.\n첫 번째 줄\n두 번째 줄',
        lyrics_file_path: 'sample1.txt',
        inst: false,
        isrc: 'KR-TEST-25-00001',
        duration_sec: 210,
        release_date: '2025-01-15',
        cover_image_url: 'https://example.com/cover1.jpg',
        lyrics_download_count: 0,
        price_per_play: '100',
        lyrics_price: '50',
        category_id: 2, // 발라드
        grade: 0, // grade_required 컬럼(정수) 매핑
        total_valid_play_count: 1250, // valid_play_count
        total_play_count: 1500,
        total_rewarded_amount: '125000',
        total_revenue: '150000',
        file_size_bytes: 5242880, // 5MB
    },
    {
        file_path: 'sample2.mp3',
        title: 'Standard Only 힙합',
        artist: '랩퍼A',
        composer: '비트메이커',
        music_arranger: '믹싱엔지니어',
        lyricist: '랩퍼A',
        lyrics_text: 'Yo, this is a test rap\nStandard grade only',
        lyrics_file_path: 'sample2.txt',
        inst: false,
        isrc: 'KR-TEST-25-00002',
        duration_sec: 180,
        release_date: '2025-02-01',
        cover_image_url: 'https://example.com/cover2.jpg',
        lyrics_download_count: 0,
        price_per_play: '150',
        lyrics_price: '75',
        category_id: 3, // 힙합
        grade: 1,
        total_valid_play_count: 800,
        total_play_count: 950,
        total_rewarded_amount: '120000',
        total_revenue: '142500',
        file_size_bytes: 4194304, // 4MB
    },
    {
        file_path: 'sample3.mp3',
        title: 'Business Only 록',
        artist: '록밴드',
        composer: '기타리스트',
        music_arranger: '베이시스트',
        lyricist: '보컬',
        lyrics_text: 'Rock and roll all night\nBusiness only track',
        lyrics_file_path: 'sample3.txt',
        inst: false,
        isrc: 'KR-TEST-25-00003',
        duration_sec: 240,
        release_date: '2025-02-15',
        cover_image_url: 'https://example.com/cover3.jpg',
        lyrics_download_count: 0,
        price_per_play: '200',
        lyrics_price: '100',
        category_id: 4, // 록
        grade: 2,
        total_valid_play_count: 500,
        total_play_count: 600,
        total_rewarded_amount: '100000',
        total_revenue: '120000',
        file_size_bytes: 6291456, // 6MB
    },
    {
        file_path: 'sample4_inst.mp3',
        title: '인스트루멘탈 재즈',
        artist: '재즈트리오',
        composer: '피아니스트',
        music_arranger: '드러머',
        lyricist: null,
        lyrics_text: null,
        lyrics_file_path: null,
        inst: true,
        isrc: 'KR-TEST-25-00004',
        duration_sec: 300,
        release_date: '2025-03-01',
        cover_image_url: 'https://example.com/cover4.jpg',
        lyrics_download_count: 0,
        price_per_play: '120',
        lyrics_price: null,
        category_id: 6, // 재즈
        grade: 0,
        total_valid_play_count: 350,
        total_play_count: 400,
        total_rewarded_amount: '42000',
        total_revenue: '48000',
        file_size_bytes: 7340032, // 7MB
    },
    {
        file_path: 'sample5.mp3',
        title: 'EDM 댄스트랙',
        artist: 'DJ Producer',
        composer: 'DJ Producer',
        music_arranger: 'Remix Artist',
        lyricist: 'Featured Singer',
        lyrics_text: 'Feel the beat, dance all night\nEDM energy',
        lyrics_file_path: 'sample5.txt',
        inst: false,
        isrc: 'KR-TEST-25-00005',
        duration_sec: 195,
        release_date: '2025-03-15',
        cover_image_url: 'https://example.com/cover5.jpg',
        lyrics_download_count: 0,
        price_per_play: '110',
        lyrics_price: '55',
        category_id: 5, // EDM
        grade: 1,
        total_valid_play_count: 2100,
        total_play_count: 2500,
        total_rewarded_amount: '231000',
        total_revenue: '275000',
        file_size_bytes: 4718592, // 4.5MB
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 데이터베이스 시딩 시작...');

        // 1. 음악 카테고리 삽입
        console.log('📁 음악 카테고리 삽입 중...');
        const insertedCategories = await db.insert(music_categories).values(dummyCategories).returning();
        console.log(`✅ ${insertedCategories.length}개 카테고리 삽입 완료`);

        // 2. 회사 데이터 삽입
        console.log('🏢 회사 데이터 삽입 중...');
        const insertedCompanies = await db.insert(companies).values(dummyCompanies).returning();
        console.log(`✅ ${insertedCompanies.length}개 회사 삽입 완료`);

        // 3. 음원 데이터 삽입
        console.log('🎵 음원 데이터 삽입 중...');
        // musics 테이블 컬럼과 맞지 않는 속성 제거 (is_active 등 삭제됨)
        const sanitizedMusics = dummyMusics.map(m => ({
            file_path: m.file_path,
            title: m.title,
            artist: m.artist,
            composer: m.composer,
            music_arranger: m.music_arranger,
            lyricist: m.lyricist,
            lyrics_text: m.lyrics_text,
            lyrics_file_path: m.lyrics_file_path,
            inst: m.inst,
            isrc: m.isrc,
            duration_sec: m.duration_sec,
            // drizzle date 컬럼은 string (YYYY-MM-DD) 허용
            release_date: m.release_date ?? null,
            cover_image_url: m.cover_image_url,
            price_per_play: m.price_per_play,
            lyrics_price: m.lyrics_price,
            category_id: m.category_id,
            grade: m.grade,
            total_valid_play_count: m.total_valid_play_count,
            total_play_count: m.total_play_count,
            total_rewarded_amount: m.total_rewarded_amount,
            total_revenue: m.total_revenue,
            file_size_bytes: m.file_size_bytes,
        }));
        const insertedMusics = await db.insert(musics).values(sanitizedMusics).returning();
        console.log(`✅ ${insertedMusics.length}개 음원 삽입 완료`);

        // 4. 구독 데이터 삽입 (Standard, Business 회사용)
        console.log('💳 구독 데이터 삽입 중...');
        const subscriptionData = [
            {
                company_id: insertedCompanies[1].id, // Standard 회사
                tier: 'standard',
                start_date: new Date('2025-01-01'),
                end_date: new Date('2025-12-31'),
                total_paid_amount: '600000', // 연간 50만원 * 12개월
                payment_count: 9, // 9개월 결제 완료
                discount_amount: '5000', // 리워드로 할인받은 금액
                actual_paid_amount: '445000', // 실제 지불한 금액
            },
            {
                company_id: insertedCompanies[2].id, // Business 회사
                tier: 'business',
                start_date: new Date('2025-01-01'),
                end_date: new Date('2025-12-31'),
                total_paid_amount: '1200000', // 연간 100만원 * 12개월
                payment_count: 9, // 9개월 결제 완료
                discount_amount: '30000', // 리워드로 할인받은 금액
                actual_paid_amount: '870000', // 실제 지불한 금액
            }
        ];
        const insertedSubscriptions = await db.insert(company_subscriptions).values(subscriptionData).returning();
        console.log(`✅ ${insertedSubscriptions.length}개 구독 삽입 완료`);

        // 5. 월별 음원 리워드 데이터 삽입
        console.log('🎁 월별 리워드 데이터 삽입 중...');
        const currentYearMonth = new Date().toISOString().slice(0, 7); // 2025-09
        const rewardData = insertedMusics.map((music, index) => ({
            music_id: music.id,
            year_month: currentYearMonth,
            total_reward_count: 1000 + (index * 200), // 1000, 1200, 1400, 1600, 1800
            remaining_reward_count: 800 + (index * 150), // 800, 950, 1100, 1250, 1400
            reward_per_play: '10', // 재생당 10원 리워드
            is_auto_reset: true,
        }));
        const insertedRewards = await db.insert(monthly_music_rewards).values(rewardData).returning();
        console.log(`✅ ${insertedRewards.length}개 월별 리워드 설정 완료`);

        // 6. 샘플 재생 기록 생성
        console.log('📊 샘플 재생 기록 생성 중...');
        const playRecords: Array<{
            music_id: number;
            using_company_id: number;
            reward_amount: string;
            reward_code: '0' | '1' | '2' | '3';
            use_case: '0' | '1' | '2';
            use_price: string;
            is_valid_play: boolean;
            play_duration_sec: number;
        }> = [];

        // 각 회사별로 다양한 재생 기록 생성
        for (let companyIdx = 0; companyIdx < insertedCompanies.length; companyIdx++) {
            const company = insertedCompanies[companyIdx];

            for (let musicIdx = 0; musicIdx < insertedMusics.length; musicIdx++) {
                const music = insertedMusics[musicIdx];

                // 회사 등급에 따른 접근 가능 음원만 재생 기록 생성
                if (music.grade <= companyIdx) {
                    // 유효 재생 기록
                    playRecords.push({
                        music_id: music.id,
                        using_company_id: company.id,
                        reward_amount: company.grade === 'free' ? '0' : '10',
                        reward_code: company.grade === 'free' ? '0' : '1',
                        use_case: music.inst ? '1' : '0',
                        use_price: '0',
                        is_valid_play: true,
                        play_duration_sec: Math.floor(Math.random() * 100) + 60, // 60-160초
                    });

                    // 무효 재생 기록도 일부 생성
                    if (Math.random() > 0.7) {
                        playRecords.push({
                            music_id: music.id,
                            using_company_id: company.id,
                            reward_amount: '0',
                            reward_code: '0',
                            use_case: music.inst ? '1' : '0',
                            use_price: '0',
                            is_valid_play: false,
                            play_duration_sec: Math.floor(Math.random() * 50) + 5, // 5-55초
                        });
                    }
                }
            }
        }

        const insertedPlays = await db.insert(music_plays).values(playRecords).returning();
        console.log(`✅ ${insertedPlays.length}개 재생 기록 생성 완료`);

        console.log('\n🎉 데이터베이스 시딩 완료!');
        console.log('\n📋 생성된 테스트 데이터:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n🏢 테스트 회사 정보:');
        insertedCompanies.forEach((company, idx) => {
            const apiKeys = [
                'free_test_api_key_64_characters_long_string_for_testing_purpose',
                'standard_test_api_key_64_characters_long_string_for_testing',
                'business_test_api_key_64_characters_long_string_for_testing'
            ];
            console.log(`${idx + 1}. ${company.name} (${company.grade})`);
            console.log(`   이메일: ${company.email}`);
            console.log(`   API 키: ${apiKeys[idx]}`);
            console.log(`   적립 리워드: ${company.total_rewards_earned}원`);
        });

        console.log('\n🎵 테스트 음원 정보:');
        insertedMusics.forEach((music, idx) => {
            console.log(`${idx + 1}. ${music.title} - ${music.artist}`);
            console.log(`   등급: ${music.grade} | 장르: 카테고리 ${music.category_id} | Inst: ${music.inst ? 'Yes' : 'No'}`);
            console.log(`   재생 횟수: ${music.total_play_count} (유효: ${music.total_valid_play_count})`);
        });

        console.log('\n🎁 이번 달 리워드 설정:');
        insertedRewards.forEach((reward, idx) => {
            console.log(`${idx + 1}. 음원 ID ${reward.music_id}: 총 ${reward.total_reward_count}회, 남은 ${reward.remaining_reward_count}회`);
            console.log(`   재생당 ${reward.reward_per_play}원`);
        });

        console.log('\n📚 테스트 방법:');
        console.log('1. 음원 재생 테스트:');
        console.log('   curl -X GET "http://localhost:3001/api/music/1/play" \\');
        console.log('     -H "x-api-key: free_test_api_key_64_characters_long_string_for_testing_purpose"');

        console.log('\n2. 가사 다운로드 테스트:');
        console.log('   curl -X GET "http://localhost:3001/api/music/1/lyric/download" \\');
        console.log('     -H "x-api-key: standard_test_api_key_64_characters_long_string_for_testing" \\');
        console.log('     -o "lyrics.txt"');

    } catch (error) {
        console.error('❌ 시딩 중 오류 발생:', error);
        throw error;
    }
}

// 스크립트 실행
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('\n✨ 시딩 완료');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 시딩 실패:', error);
            process.exit(1);
        });
}

export { seedDatabase };
