"use client";

import { useGetTeamsQuery, useGetUsersQuery } from "@/state/api";
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
  { field: "id", headerName: "Team ID", width: 100 },
  { field: "name", headerName: "Team Name", width: 200 },
  { field: "productOwnerUsername", headerName: "Product Owner", width: 200 },
  { field: "projectManagerUsername", headerName: "Project Manager", width: 200 },
];

const Teams = () => {
  const { data: teams, isLoading: isTeamsLoading, isError: isTeamsError } = useGetTeamsQuery();
  const { data: users, isLoading: isUsersLoading, isError: isUsersError } = useGetUsersQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isTeamsLoading || isUsersLoading) return <div>Loading...</div>;
  if (isTeamsError || !teams || isUsersError || !users) return <div>Error fetching data</div>;

  // Преобразуем данные команд, добавляя имена пользователей
  const transformedTeams = teams.map((team) => {
    const productOwner = users.find((user) => user.id === team.productOwnerId);
    const projectManager = users.find((user) => user.id === team.projectManagerId);

    return {
      ...team,
      productOwnerUsername: productOwner?.username || "Unknown",
      projectManagerUsername: projectManager?.username || "Unknown",
    };
  });

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Teams" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={transformedTeams || []}
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