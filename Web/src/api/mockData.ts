import {
  Difficulty,
  ReadingDifficulty,
  type Topic,
  type Vocabulary,
  type Reading,
  type DashboardStats,
} from '../types';

// ─── Topics ───────────────────────────────────────────────────────────────────
export const mockTopics: Topic[] = [
  { id: '1', name: 'Travel', description: 'Words related to travel and tourism', color: '#ec4899', icon: '✈️', vocabularyCount: 12, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: '2', name: 'Technology', description: 'Modern tech vocabulary', color: '#8b5cf6', icon: '💻', vocabularyCount: 18, createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
  { id: '3', name: 'Business', description: 'Professional business terms', color: '#3b82f6', icon: '💼', vocabularyCount: 15, createdAt: '2025-01-03T00:00:00Z', updatedAt: '2025-01-03T00:00:00Z' },
  { id: '4', name: 'Science', description: 'Scientific vocabulary', color: '#10b981', icon: '🔬', vocabularyCount: 10, createdAt: '2025-01-04T00:00:00Z', updatedAt: '2025-01-04T00:00:00Z' },
  { id: '5', name: 'Daily Life', description: 'Everyday English expressions', color: '#f59e0b', icon: '🏠', vocabularyCount: 22, createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-01-05T00:00:00Z' },
  { id: '6', name: 'Academic', description: 'Words for academic writing', color: '#ef4444', icon: '🎓', vocabularyCount: 8, createdAt: '2025-01-06T00:00:00Z', updatedAt: '2025-01-06T00:00:00Z' },
];

// ─── Vocabulary ───────────────────────────────────────────────────────────────
const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

export const mockVocabulary: Vocabulary[] = [
  { id: 'v1', word: 'ambiguous', ipa: '/æmˈbɪɡ.ju.əs/', meaning: 'Open to more than one interpretation', exampleEn: 'The ending of the movie was ambiguous.', exampleVi: 'Kết thúc của bộ phim rất mơ hồ.', topicId: '6', topicName: 'Academic', difficulty: Difficulty.Medium, isLearned: true, createdAt: today, updatedAt: today },
  { id: 'v2', word: 'ephemeral', ipa: '/ɪˈfem.ər.əl/', meaning: 'Lasting for a very short time; transient', exampleEn: 'Fame in social media is often ephemeral.', exampleVi: 'Sự nổi tiếng trên mạng xã hội thường thoáng qua.', topicId: '6', topicName: 'Academic', difficulty: Difficulty.Hard, isLearned: false, createdAt: today, updatedAt: today },
  { id: 'v3', word: 'itinerary', ipa: '/aɪˈtɪn.ər.er.i/', meaning: 'A planned route or journey; a travel schedule', exampleEn: 'She carefully planned her itinerary for the trip.', exampleVi: 'Cô ấy lên kế hoạch hành trình cẩn thận cho chuyến đi.', topicId: '1', topicName: 'Travel', difficulty: Difficulty.Medium, isLearned: false, createdAt: today, updatedAt: today },
  { id: 'v4', word: 'algorithm', ipa: '/ˈæl.ɡə.rɪð.əm/', meaning: 'A process or set of rules used in calculations', exampleEn: "Google's search algorithm is highly sophisticated.", exampleVi: 'Thuật toán tìm kiếm của Google rất tinh vi.', topicId: '2', topicName: 'Technology', difficulty: Difficulty.Hard, isLearned: true, createdAt: today, updatedAt: today },
  { id: 'v5', word: 'benevolent', ipa: '/bəˈnev.əl.ənt/', meaning: 'Well meaning and kindly; charitable', exampleEn: 'The benevolent donor funded the new library.', exampleVi: 'Nhà tài trợ hào phóng đã tài trợ cho thư viện mới.', topicId: '5', topicName: 'Daily Life', difficulty: Difficulty.Medium, isLearned: true, createdAt: today, updatedAt: today },
  { id: 'v6', word: 'innovation', ipa: '/ˌɪn.əˈveɪ.ʃən/', meaning: 'The action or process of innovating', exampleEn: 'Innovation drives the tech industry forward.', exampleVi: 'Đổi mới thúc đẩy ngành công nghệ tiến lên.', topicId: '2', topicName: 'Technology', difficulty: Difficulty.Easy, isLearned: true, createdAt: today, updatedAt: today },
  { id: 'v7', word: 'resilient', ipa: '/rɪˈzɪl.i.ənt/', meaning: 'Able to recover quickly from difficult conditions', exampleEn: 'She is remarkably resilient in the face of adversity.', exampleVi: 'Cô ấy rất kiên cường trước nghịch cảnh.', topicId: '5', topicName: 'Daily Life', difficulty: Difficulty.Medium, isLearned: false, createdAt: today, updatedAt: today },
  { id: 'v8', word: 'paradigm', ipa: '/ˈpær.ə.daɪm/', meaning: 'A typical example or model of something', exampleEn: 'This project represents a paradigm shift in the industry.', exampleVi: 'Dự án này đại diện cho sự thay đổi mô hình trong ngành.', topicId: '3', topicName: 'Business', difficulty: Difficulty.SuperHard, isLearned: false, createdAt: today, updatedAt: today },
  { id: 'v9', word: 'commute', ipa: '/kəˈmjuːt/', meaning: 'Travel some distance between one\'s home and place of work', exampleEn: 'He commutes to work by train every day.', exampleVi: 'Anh ấy đi tàu đến nơi làm việc mỗi ngày.', topicId: '5', topicName: 'Daily Life', difficulty: Difficulty.Easy, isLearned: true, createdAt: today, updatedAt: today },
  { id: 'v10', word: 'hypothesis', ipa: '/haɪˈpɒθ.ə.sɪs/', meaning: 'A supposition or proposed explanation', exampleEn: 'The scientist tested her hypothesis in the lab.', exampleVi: 'Nhà khoa học kiểm tra giả thuyết của mình trong phòng thí nghiệm.', topicId: '4', topicName: 'Science', difficulty: Difficulty.Hard, isLearned: false, createdAt: today, updatedAt: today },
  { id: 'v11', word: 'turbulence', ipa: '/ˈtɜː.bjʊ.ləns/', meaning: 'Irregular atmospheric motion causing bumpy flights', exampleEn: 'The pilot warned passengers about expected turbulence.', exampleVi: 'Phi công cảnh báo hành khách về nhiễu loạn dự kiến.', topicId: '1', topicName: 'Travel', difficulty: Difficulty.Medium, isLearned: false, createdAt: today, updatedAt: today },
  { id: 'v12', word: 'synergy', ipa: '/ˈsɪn.ə.dʒi/', meaning: 'The interaction of elements producing a combined effect greater than the sum', exampleEn: 'The merger created a powerful synergy between both companies.', exampleVi: 'Vụ sáp nhập tạo ra sức mạnh hiệp đồng mạnh mẽ giữa hai công ty.', topicId: '3', topicName: 'Business', difficulty: Difficulty.Hard, isLearned: false, createdAt: yesterday, updatedAt: yesterday },
  { id: 'v13', word: 'catalyst', ipa: '/ˈkæt.ə.lɪst/', meaning: 'A substance or person that increases the rate of change', exampleEn: 'The new policy acted as a catalyst for economic growth.', exampleVi: 'Chính sách mới đóng vai trò như chất xúc tác cho tăng trưởng kinh tế.', topicId: '4', topicName: 'Science', difficulty: Difficulty.Hard, isLearned: false, createdAt: yesterday, updatedAt: yesterday },
  { id: 'v14', word: 'eloquent', ipa: '/ˈel.ə.kwənt/', meaning: 'Fluent or persuasive in speaking or writing', exampleEn: 'She delivered an eloquent speech at the conference.', exampleVi: 'Cô ấy đã có bài phát biểu hùng hồn tại hội nghị.', topicId: '6', topicName: 'Academic', difficulty: Difficulty.Medium, isLearned: true, createdAt: today, updatedAt: today },
  { id: 'v15', word: 'meticulous', ipa: '/məˈtɪk.jʊ.ləs/', meaning: 'Showing great attention to detail; very careful', exampleEn: 'The artist was meticulous in her brushwork.', exampleVi: 'Nghệ sĩ rất tỉ mỉ trong từng nét cọ.', topicId: '6', topicName: 'Academic', difficulty: Difficulty.Medium, isLearned: false, createdAt: today, updatedAt: today },
];

// ─── Readings ─────────────────────────────────────────────────────────────────
export const mockReadings: Reading[] = [
  {
    id: 'r1',
    title: 'The Future of Remote Work',
    topicId: '3',
    topicName: 'Business',
    paragraph: 'The global pandemic has fundamentally transformed the way we work. Remote work, once considered a privilege for a select few, has become a standard practice for millions of professionals worldwide. Companies have had to adapt rapidly, investing in digital infrastructure and collaboration tools to maintain productivity. This shift has brought both opportunities and challenges. Employees enjoy greater flexibility and eliminate long commutes, while organizations must navigate issues of team cohesion and work-life balance. Experts predict that hybrid models—combining office and remote work—will define the future of work for the foreseeable future.',
    translation: 'Đại dịch toàn cầu đã thay đổi căn bản cách chúng ta làm việc. Làm việc từ xa, từng được coi là đặc quyền của một số ít người, đã trở thành thông lệ tiêu chuẩn cho hàng triệu chuyên gia trên toàn thế giới.',
    difficulty: ReadingDifficulty.B2,
    estimatedMinutes: 4,
    vocabularyHighlights: ['fundamentally', 'infrastructure', 'productivity', 'flexibility', 'cohesion'],
    questions: [
      { id: 'q1', question: 'What has the pandemic fundamentally changed?', choices: ['The way we eat', 'The way we work', 'The way we travel', 'The way we shop'], correctAnswer: 1, explanation: 'The passage states that the pandemic has "fundamentally transformed the way we work".' },
      { id: 'q2', question: 'What do employees enjoy with remote work?', choices: ['Higher salaries', 'Greater flexibility', 'More vacation days', 'Better equipment'], correctAnswer: 1, explanation: 'The passage mentions "Employees enjoy greater flexibility" as a benefit of remote work.' },
      { id: 'q3', question: 'What model do experts predict for the future?', choices: ['Fully remote', 'Fully office-based', 'Hybrid models', 'Freelancing'], correctAnswer: 2, explanation: 'The passage states experts predict "hybrid models—combining office and remote work" will define future work.' },
    ],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'r2',
    title: 'Exploring Ancient Rome',
    topicId: '1',
    topicName: 'Travel',
    paragraph: 'Rome, the Eternal City, stands as one of the world\'s most captivating travel destinations. Its streets serve as a living museum, where ancient ruins coexist with Renaissance palaces and modern cafés. Visitors can wander through the iconic Colosseum, marvel at the architectural genius of the Pantheon, and toss a coin into the legendary Trevi Fountain. The city\'s culinary scene is equally impressive, offering authentic Roman cuisine in trattorias tucked away in cobblestone alleyways. Whether you are a history enthusiast or a food lover, Rome promises an unforgettable experience that connects the past with the present.',
    translation: 'Rome, Thành phố Vĩnh cửu, là một trong những điểm đến du lịch hấp dẫn nhất thế giới. Những con phố của nó như một bảo tàng sống, nơi những tàn tích cổ đại cùng tồn tại với những cung điện thời Phục hưng và những quán cà phê hiện đại.',
    difficulty: ReadingDifficulty.B1,
    estimatedMinutes: 3,
    vocabularyHighlights: ['captivating', 'coexist', 'architectural', 'culinary', 'authentic'],
    questions: [
      { id: 'q4', question: 'What is Rome often called?', choices: ['The Golden City', 'The Eternal City', 'The Ancient City', 'The Beautiful City'], correctAnswer: 1, explanation: 'The passage refers to Rome as "the Eternal City".' },
      { id: 'q5', question: 'What can visitors do at the Trevi Fountain?', choices: ['Swim', 'Eat pizza', 'Toss a coin', 'Take a boat ride'], correctAnswer: 2, explanation: 'The passage mentions visitors can "toss a coin into the legendary Trevi Fountain".' },
    ],
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    id: 'r3',
    title: 'Artificial Intelligence in Healthcare',
    topicId: '2',
    topicName: 'Technology',
    paragraph: 'Artificial intelligence is revolutionizing the healthcare industry in profound ways. Machine learning algorithms can now analyze medical images with accuracy that rivals experienced radiologists, enabling earlier and more precise diagnoses. AI-powered chatbots provide patients with immediate responses to health queries, reducing the burden on medical professionals. Furthermore, predictive analytics help hospitals allocate resources more efficiently, preventing shortages during high-demand periods. Despite these advances, ethical questions remain about data privacy and algorithmic bias. The integration of AI in healthcare requires careful governance to ensure that technology serves patients equitably and transparently.',
    translation: 'Trí tuệ nhân tạo đang cách mạng hóa ngành y tế theo những cách sâu sắc. Các thuật toán học máy hiện có thể phân tích hình ảnh y tế với độ chính xác sánh ngang với các bác sĩ X quang có kinh nghiệm.',
    difficulty: ReadingDifficulty.C1,
    estimatedMinutes: 5,
    vocabularyHighlights: ['revolutionizing', 'algorithms', 'diagnoses', 'predictive', 'governance', 'equitably'],
    questions: [
      { id: 'q6', question: 'What can ML algorithms analyze as accurately as radiologists?', choices: ['Patient records', 'Medical images', 'Lab reports', 'Prescriptions'], correctAnswer: 1, explanation: 'The passage states ML algorithms "can analyze medical images with accuracy that rivals experienced radiologists".' },
      { id: 'q7', question: 'What ethical concern is mentioned?', choices: ['Job loss', 'Cost increase', 'Data privacy and algorithmic bias', 'Slow adoption'], correctAnswer: 2, explanation: 'The passage raises "ethical questions about data privacy and algorithmic bias".' },
    ],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const mockDashboardStats: DashboardStats = {
  totalVocabulary: mockVocabulary.length,
  learnedToday: mockVocabulary.filter(v => v.isLearned && v.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length,
  totalReadings: mockReadings.length,
  totalTopics: mockTopics.length,
  weeklyProgress: [3, 5, 2, 8, 6, 4, 7],
  streakDays: 7,
  masteredWords: mockVocabulary.filter(v => v.isLearned).length,
};
