import { prisma } from '@/lib/prisma';

export async function cleanupOldSessions() {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await prisma.session.deleteMany({
      where: {
        createdAt: {
          lt: twoDaysAgo,
        },
      },
    });

    console.log(`Cleaned up ${result.count} old sessions`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup old sessions:', error);
    throw error;
  }
}

export async function setupCleanupSchedule() {
  if (process.env.NODE_ENV === 'production') {
    const intervalMs = 24 * 60 * 60 * 1000; // 24 hours
    
    setInterval(async () => {
      try {
        await cleanupOldSessions();
      } catch (error) {
        console.error('Scheduled cleanup failed:', error);
      }
    }, intervalMs);
    
    console.log('Cleanup schedule setup completed');
  }
}