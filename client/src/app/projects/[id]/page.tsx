"use client";

import React,{useState} from 'react'
import ProjectHeader from "@/app/projects/ProjectHeader"
import Board from '../BoardView';
import List from '../ListView';
import TimeLine from '../TimelineView';
import Table from '../TableView';
import { use } from 'react';
import ModalNewTask from "@/components/ModalNewTask";

// type Props = {
//     params: Promise<{ id: string }>;
// } 
type Props = {
    params:{id:string}
} 

const Project = ({params}: Props) => {
    const {id} =params;


// const Project = ({params}: Props) => {
//     const resolvedParams = use(params); 
//     const { id } = resolvedParams;
    const[activeTab,setActiveTab]=useState("Board");
    const [isModalNewTaskOpen,setIsModalNewTaskOpen]=useState(false);

    return (
        <div>
            {/* Modal new task */}
            
            <ModalNewTask
                isOpen={isModalNewTaskOpen}
                onClose={() => setIsModalNewTaskOpen(false)}
                id={id}
            />


            <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab === "Канбан" && (
        <Board id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
        )}
        {activeTab === "Список" && (
        <List id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
        )}
        {activeTab === "Таймлайн" && (
        <TimeLine id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
        )}
        {activeTab === "Таблица" && (
        <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
        )}
        </div>
    )
}

export default Project