// client/src/components/Teams.tsx
"use client";

import { useGetTeamsQuery } from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "id", headerName: "Номер", width: 100 },
  { field: "teamName", headerName: "Название команды", width: 200 },
  {
    field: "productOwner",
    headerName: "Создатель команды",
    width: 200,
    renderCell: (params) => (
      <div className="flex items-center gap-2">
        {params.value?.profilePictureUrl ? (
          <img
            src={params.value.profilePictureUrl}
            alt={params.value.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">{params.value?.username?.charAt(0) || "N/A"}</span>
          </div>
        )}
        <span>{params.value?.username || "N/A"}</span>
      </div>
    ),
  },
  {
    field: "projectManager",
    headerName: "Руководитель команды",
    width: 200,
    renderCell: (params) => (
      <div className="flex items-center gap-2">
        {params.value?.profilePictureUrl ? (
          <img
            src={params.value.profilePictureUrl}
            alt={params.value.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">{params.value?.username?.charAt(0) || "N/A"}</span>
          </div>
        )}
        <span>{params.value?.username || "N/A"}</span>
      </div>
    ),
  },
  {
    field: "teamMembers",
    headerName: "Участники команды",
    width: 300,
    renderCell: (params) => (
      <div className="flex flex-wrap gap-2">
        {params.value && params.value.length > 0 ? (
          params.value.map((member: { username: string; profilePictureUrl?: string }, index: number) => (
            <div key={index} className="flex items-center gap-1">
              {member.profilePictureUrl ? (
                <img
                  src={member.profilePictureUrl}
                  alt={member.username}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">{member.username.charAt(0)}</span>
                </div>
              )}
              <span>{member.username}</span>
            </div>
          ))
        ) : (
          "No members"
        )}
      </div>
    ),
  },
];

const Teams = () => {
  const { data: teams, isLoading: isTeamsLoading, isError: isTeamsError } = useGetTeamsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isTeamsLoading) return <div>Loading...</div>;
  if (isTeamsError || !teams) return <div>Error fetching data</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Команды" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={teams || []}
          columns={columns}
          pagination
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default Teams;