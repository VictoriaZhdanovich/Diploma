'use client';

import Modal from '@/components/Modal';
import { Priority, Status, useCreateTaskMutation, useGetUsersQuery } from '@/state/api';
import React, { useState, useEffect } from 'react';
import { formatISO } from 'date-fns/formatISO';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading, error }] = useCreateTaskMutation();
  const { data: users, isLoading: usersLoading, error: usersError } = useGetUsersQuery();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [authorUserId, setAuthorUserId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');

  // Сбрасываем выбор, если users изменились
  useEffect(() => {
    if (!users || usersLoading) {
      // Если users ещё не загрузились, ничего не делаем
      return;
    }

    if (users.length > 0) {
      if (authorUserId && !users.some((user) => user.userId && user.userId.toString() === authorUserId)) {
        setAuthorUserId('');
      }
      if (assignedUserId && !users.some((user) => user.userId && user.userId.toString() === assignedUserId)) {
        setAssignedUserId('');
      }
    } else {
      setAuthorUserId('');
      setAssignedUserId('');
    }
  }, [users, usersLoading, authorUserId, assignedUserId]);

  const handleSubmit = async () => {
    // Проверка: все обязательные поля должны быть заполнены
    if (!title || !authorUserId || !assignedUserId) {
      alert("Пожалуйста, заполните все обязательные поля: заголовок, инициатор и исполнитель.");
      return;
    }

    const parsedAuthorUserId = parseInt(authorUserId);
    const parsedAssignedUserId = parseInt(assignedUserId);

    // Проверка: убедимся, что parseInt вернул валидное число
    if (isNaN(parsedAuthorUserId) || isNaN(parsedAssignedUserId)) {
      alert("Некорректный выбор инициатора или исполнителя.");
      return;
    }

    const formattedStartDate = startDate ? formatISO(new Date(startDate), { representation: 'complete' }) : undefined;
    const formattedDueDate = dueDate ? formatISO(new Date(dueDate), { representation: 'complete' }) : undefined;

    // Проверка: dueDate не раньше startDate
    if (formattedStartDate && formattedDueDate && new Date(formattedDueDate) < new Date(formattedStartDate)) {
      alert("Конечная дата не может быть раньше начальной!");
      return;
    }

    const payload = {
      title,
      description,
      status,
      priority: priority || Priority.Backlog,
      tags,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      points: 0,
      authorUserId: parsedAuthorUserId,
      assignedUserId: parsedAssignedUserId,
      projectId: Number(id),
    };

    console.log("Payload for createTask:", payload);

    try {
      await createTask(payload).unwrap();
      onClose();
    } catch (err: any) {
      console.error('Failed to create task:', err);
    }
  };

  const isFormValid = () => {
    return title && authorUserId && assignedUserId && id !== null && users && users.length > 0;
  };

  const selectStyles =
    'mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';
  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  // Для отладки: логируем пользователя
  const getUserById = (userId: string) => {
    const parsedId = parseInt(userId);
    if (isNaN(parsedId)) return null;
    const user = users?.find((u) => u.userId === parsedId);
    console.log(`User for ID ${parsedId}:`, user);
    return user;
  };

  // Функция для безопасного получения сообщения об ошибке
  const getErrorMessage = (err: any): string => {
    if (err && 'status' in err && 'data' in err) {
      return (err.data as any)?.message || JSON.stringify(err.data);
    }
    return err?.message || JSON.stringify(err);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Создать новую задачу">
      {usersLoading && <p>Загрузка пользователей...</p>}
      {usersError && (
        <p className="text-red-500">
          Ошибка загрузки пользователей: {getErrorMessage(usersError)}
        </p>
      )}
      {!usersLoading && !usersError && (!users || users.length === 0) && (
        <p className="text-red-500">
          Список пользователей пуст. Невозможно создать задачу.
        </p>
      )}
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
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Инициатор
          </label>
          <select
            className={selectStyles}
            value={authorUserId}
            onChange={(e) => setAuthorUserId(e.target.value)}
            required
          >
            <option value="">Выберите инициатора</option>
            {users?.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.username}
              </option>
            ))}
          </select>
          {authorUserId && (
            <div className="mt-2 flex items-center">
              <img
                src={
                  getUserById(authorUserId)?.profilePictureUrl || '/user.jpg'
                }
                alt="Фото инициатора"
                className="w-10 h-10 rounded-full mr-2"
                onError={(e) => (e.currentTarget.src = '/user.jpg')}
              />
              <span className="dark:text-gray-200">
                {getUserById(authorUserId)?.username}
              </span>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Исполнитель
          </label>
          <select
            className={selectStyles}
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            required
          >
            <option value="">Выберите исполнителя</option>
            {users?.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.username}
              </option>
            ))}
          </select>
          {assignedUserId && (
            <div className="mt-2 flex items-center">
              <img
                src={
                  getUserById(assignedUserId)?.profilePictureUrl || '/user.jpg'
                }
                alt="Фото исполнителя"
                className="w-10 h-10 rounded-full mr-2"
                onError={(e) => (e.currentTarget.src = '/user.jpg')}
              />
              <span className="dark:text-gray-200">
                {getUserById(assignedUserId)?.username}
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">
            Произошла ошибка при создании задачи: {getErrorMessage(error)}
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