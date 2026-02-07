const express = require('express');
const prisma = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all links for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId: req.user.userId },
      orderBy: { order: 'asc' },
    });
    res.json(links);
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Create new link
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, url, description, icon } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    // Get max order for the user
    const maxOrder = await prisma.link.findFirst({
      where: { userId: req.user.userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const link = await prisma.link.create({
      data: {
        userId: req.user.userId,
        title,
        url,
        description: description || null,
        icon: icon || null,
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// Update link
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description, icon, active, order } = req.body;

    // Verify link belongs to user
    const existingLink = await prisma.link.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existingLink) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const link = await prisma.link.update({
      where: { id },
      data: {
        title: title ?? existingLink.title,
        url: url ?? existingLink.url,
        description: description !== undefined ? description : existingLink.description,
        icon: icon !== undefined ? icon : existingLink.icon,
        active: active !== undefined ? active : existingLink.active,
        order: order !== undefined ? order : existingLink.order,
      },
    });

    res.json(link);
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Delete link
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify link belongs to user
    const existingLink = await prisma.link.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existingLink) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.link.delete({ where: { id } });
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// Reorder links
router.post('/reorder', authenticateToken, async (req, res) => {
  try {
    const { linkIds } = req.body;

    if (!Array.isArray(linkIds)) {
      return res.status(400).json({ error: 'linkIds array required' });
    }

    // Update order for each link
    const updates = linkIds.map((id, index) =>
      prisma.link.updateMany({
        where: { id, userId: req.user.userId },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
    res.json({ message: 'Links reordered successfully' });
  } catch (error) {
    console.error('Reorder links error:', error);
    res.status(500).json({ error: 'Failed to reorder links' });
  }
});

module.exports = router;