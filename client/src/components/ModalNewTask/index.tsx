'use client';

import Modal from '@/components/Modal';
import { Priority, Status, useCreateTaskMutation } from '@/state/api';
import React, { useState } from 'react';
import { formatISO } from 'date-fns/formatISO';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading, error }] = useCreateTaskMutation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [authorUserId, setAuthorUserId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [projectId, setProjectId] = useState('');

  console.log('isFormValid:', title && authorUserId && (id !== null || projectId));
  console.log('title:', title);
  console.log('authorUserId:', authorUserId);
  console.log('id:', id);
  console.log('projectId:', projectId);

  const handleSubmit = async () => {
    if (!title || !authorUserId || (id === null && !projectId)) return;

    const formattedStartDate = startDate ? formatISO(new Date(startDate), { representation: 'complete' }) : undefined;
    const formattedDueDate = dueDate ? formatISO(new Date(dueDate), { representation: 'complete' }) : undefined;

    try {
      await createTask({
        title,
        description,
        status,
        priority,
        tags,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
        authorUserId: parseInt(authorUserId),
        assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined,
        projectId: id !== null ? Number(id) : Number(projectId),
      }).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const isFormValid = () => {
    return title && authorUserId && (id !== null || projectId);
  };

  const selectStyles =
    'mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Создать новую задачу">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className={inputStyles}
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={inputStyles}
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <select
            className={selectStyles}
            value={status}
            onChange={(e) =>
              setStatus(Status[e.target.value as keyof typeof Status])
            }
          >
            <option value="">Выберите статус</option>
            <option value={Status.ToDo}>Новая</option>
            <option value={Status.WorkInProgress}>В работе</option>
            <option value={Status.UnderReview}>На проверке</option>
            <option value={Status.Completed}>Выполнена</option>
          </select>
          <select
            className={selectStyles}
            value={priority}
            onChange={(e) =>
              setPriority(Priority[e.target.value as keyof typeof Priority])
            }
          >
            <option value="">Выберите приоритет</option>
            <option value={Priority.Urgent}>Наивысший</option>
            <option value={Priority.High}>Высокий</option>
            <option value={Priority.Medium}>Средний</option>
            <option value={Priority.Low}>Низкий</option>
            <option value={Priority.Backlog}>Backlog</option>
          </select>
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="Теги (через запятую)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className={inputStyles}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="ID инициатора"
          value={authorUserId}
          onChange={(e) => setAuthorUserId(e.target.value)}
        />
        <input
          type="text"
          className={inputStyles}
          placeholder="ID исполнителя"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
        />
        <input
          type="text"
          className={inputStyles}
          placeholder="ProjectId"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        {error && (
          <p className="text-red-500 text-sm">
            Произошла ошибка при создании задачи: {JSON.stringify(error)}
          </p>
        )}
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-600 ${
            !isFormValid() || isLoading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? 'Создание...' : 'Создать задачу'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;