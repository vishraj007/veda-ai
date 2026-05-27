import type { Request, Response, NextFunction } from 'express';
import { GroupModel } from '../models/Group.js';
import { AssignmentModel } from '../models/Assignment.js';
import { createError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/** Create a new group */
export async function createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, subject, section, description, color, icon } = req.body;
    if (!name || name.trim().length < 2) {
      throw createError('Group name must be at least 2 characters', 400);
    }
    const group = await GroupModel.create({
      name: name.trim(),
      subject: subject?.trim() || '',
      section: section?.trim() || '',
      description: description?.trim() || '',
      color: color || '#7C3AED',
      icon: icon || '🏫',
    });
    res.status(201).json({ success: true, data: group.toJSON() });
  } catch (error) { next(error); }
}

/** List all groups */
export async function listGroups(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const groups = await GroupModel.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: groups });
  } catch (error) { next(error); }
}

/** Get a single group by ID */
export async function getGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = await GroupModel.findById(req.params.id).lean();
    if (!group) throw createError('Group not found', 404);
    res.json({ success: true, data: group });
  } catch (error) { next(error); }
}

/** Update group details */
export async function updateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, subject, section, description, color, icon } = req.body;
    const group = await GroupModel.findByIdAndUpdate(
      req.params.id,
      { name, subject, section, description, color, icon },
      { new: true, runValidators: true }
    );
    if (!group) throw createError('Group not found', 404);
    res.json({ success: true, data: group.toJSON() });
  } catch (error) { next(error); }
}

/** Delete a group */
export async function deleteGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = await GroupModel.findByIdAndDelete(req.params.id);
    if (!group) throw createError('Group not found', 404);
    res.json({ success: true, data: { message: 'Group deleted' } });
  } catch (error) { next(error); }
}

/** Add a single student to group */
export async function addStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, rollNumber } = req.body;
    if (!name || name.trim().length < 1) {
      throw createError('Student name is required', 400);
    }
    const group = await GroupModel.findById(req.params.id);
    if (!group) throw createError('Group not found', 404);

    group.students.push({ name: name.trim(), email: email?.trim() || '', rollNumber: rollNumber?.trim() || '' });
    await group.save();
    res.status(201).json({ success: true, data: group.toJSON() });
  } catch (error) { next(error); }
}

/** Bulk import students from CSV data */
export async function importStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      throw createError('Students array is required', 400);
    }
    const group = await GroupModel.findById(req.params.id);
    if (!group) throw createError('Group not found', 404);

    let added = 0;
    for (const s of students) {
      if (s.name && s.name.trim()) {
        group.students.push({
          name: s.name.trim(),
          email: s.email?.trim() || '',
          rollNumber: s.rollNumber?.trim() || '',
        });
        added++;
      }
    }
    await group.save();
    logger.info(`Imported ${added} students to group ${group.name}`);
    res.json({ success: true, data: group.toJSON(), added });
  } catch (error) { next(error); }
}

/** Remove a student from group */
export async function removeStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { studentId } = req.params;
    const group = await GroupModel.findById(req.params.id);
    if (!group) throw createError('Group not found', 404);

    group.students = group.students.filter((s) => (s as unknown as { _id: { toString(): string } })._id?.toString() !== studentId) as typeof group.students;
    await group.save();
    res.json({ success: true, data: group.toJSON() });
  } catch (error) { next(error); }
}

/** Assign a paper/assignment to a group */
export async function assignPaper(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignmentId, dueDate } = req.body;
    const group = await GroupModel.findById(req.params.id);
    if (!group) throw createError('Group not found', 404);

    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment) throw createError('Assignment not found', 404);

    // Check if already assigned
    const already = group.assignedPapers.some((p) => p.assignmentId.toString() === assignmentId);
    if (already) throw createError('Paper already assigned to this group', 400);

    group.assignedPapers.push({
      assignmentId: assignment._id,
      assignedAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : assignment.dueDate,
      title: assignment.title,
    });
    await group.save();
    res.json({ success: true, data: group.toJSON() });
  } catch (error) { next(error); }
}

/** Remove an assigned paper from group */
export async function unassignPaper(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const group = await GroupModel.findById(req.params.id);
    if (!group) throw createError('Group not found', 404);

    group.assignedPapers = group.assignedPapers.filter(
      (p) => p.assignmentId.toString() !== assignmentId
    ) as typeof group.assignedPapers;
    await group.save();
    res.json({ success: true, data: group.toJSON() });
  } catch (error) { next(error); }
}
