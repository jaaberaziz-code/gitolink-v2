const express = require('express');
const prisma = require('../models');

const router = express.Router();

// Get public profile by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        createdAt: true,
        links: {
          where: { active: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            icon: true,
            clicks: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;