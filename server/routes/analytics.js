const express = require('express');
const prisma = require('../models');
const useragent = require('useragent');

const router = express.Router();

// Track link click
router.post('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    // Get link info
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { user: true },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Parse user agent
    const agent = useragent.parse(req.headers['user-agent']);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Create analytics record
    await prisma.analytics.create({
      data: {
        linkId,
        userId: link.userId,
        ip: ip?.toString() || null,
        device: agent.device.toString(),
        browser: agent.toAgent(),
        os: agent.os.toString(),
      },
    });

    // Increment click count
    await prisma.link.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Get analytics for current user
router.get('/', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = jwt.verify(token, JWT_SECRET);

    const analytics = await prisma.analytics.findMany({
      where: { userId: decoded.userId },
      include: {
        link: {
          select: { title: true, url: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Aggregate stats
    const totalClicks = await prisma.analytics.count({
      where: { userId: decoded.userId },
    });

    const linkStats = await prisma.link.findMany({
      where: { userId: decoded.userId },
      select: {
        id: true,
        title: true,
        clicks: true,
      },
      orderBy: { clicks: 'desc' },
    });

    res.json({
      recent: analytics,
      totalClicks,
      linkStats,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;