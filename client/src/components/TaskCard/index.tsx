'use client';

import { Task } from '@/state/api';
import { format } from 'date-fns';
import Image from 'next/image';
import React from 'react';

type Props = {
    task: Task;
};

const TaskCard = ({ task }: Props) => {
    return (
        <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
        {task.attachments && task.attachments.length > 0 && (
            <div>
            <strong>Вложения:</strong>
            <div className="flex flex-wrap">
                {task.attachments[0] && task.attachments[0].fileUrl && (
                <Image
                    src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.attachments[0].fileUrl}`}
                    alt={task.attachments[0].fileName || 'Attachment'}
                    width={400}
                    height={200}
                    className="rounded-md"
                />
                )}
            </div>
            </div>
            
        )}
        <p>
        <strong>ID:</strong> {task.id}
        </p>
        <p>
            <strong>Заголовок:</strong> {task.title}
        </p>
        <p>
            <strong>Описание:</strong>{" "}
            {task.description || ""}
        </p>
        <p>
            <strong>Статус:</strong> {task.status}
        </p>
        <p>
            <strong>Приоритет:</strong> {task.priority}
        </p>
        <p>
            <strong>Тэги:</strong> {task.tags || ""}
        </p>
        <p>
            <strong>Дата начала:</strong>{" "}
            {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
        </p>
        <p>
            <strong>Дата окончания:</strong>{" "}
            {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
        </p>
        <p>
            <strong>Создатель:</strong>{" "}
            {task.author ? task.author.username : "Unknown"}
        </p>
        <p>
            <strong>Исполнитель:</strong>{" "}
            {task.assignee ? task.assignee.username : "Unassigned"}
        </p>

        </div>
    );
};

export default TaskCard;