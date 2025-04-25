'use client';

import Modal from '@/components/Modal';
import { useCreateProjectMutation } from '@/state/api';
import React, { useState } from 'react';
import { formatISO } from 'date-fns/formatISO'; 

type Props = {
    isOpen: boolean;
    onClose: () => void;
    };

    const ModalNewProject = ({ isOpen, onClose }: Props) => {
    const [createProject, { isLoading }] = useCreateProjectMutation();
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = async () => {
        if (!projectName || !startDate || !endDate) return;

        const formattedStartDate = formatISO(new Date(startDate), {
        representation: 'complete',
        });
        const formattedEndDate = formatISO(new Date(endDate), {
        representation: 'complete',
        });

        await createProject({
        name: projectName,
        description,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        });
        onClose(); 
    };

    const isFormValid = () => {
        return projectName && description && startDate && endDate;
    };

    const inputStyles =
        'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

    return (
        <Modal isOpen={isOpen} onClose={onClose} name="Создать навый проект">
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
            placeholder="Название"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            />
            <textarea
            className={inputStyles}
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />
            </div>
            <button
            type="submit"
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                !isFormValid() || isLoading ? 'cursor-not-allowed opacity-100' : ''
            }`}
            disabled={!isFormValid() || isLoading}
            >
            {isLoading ? 'Creating...' : 'Create Project'}
            </button>
        </form>
        </Modal>
    );
};

export default ModalNewProject;