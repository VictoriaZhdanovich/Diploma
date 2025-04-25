export const dataGridClassNames =
"border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";

export const dataGridSxStyles = (isDarkMode: boolean) => {
return {
        "& .MuiDataGrid-columnHeaders": {
        color: `${isDarkMode ? "#242424" : ""}`,
        '& [role="row"] > *': {
            backgroundColor: `${isDarkMode ? "#FFFFF" : "white"}`,
            borderColor: `${isDarkMode ? "#2d3135" : ""}`,
        },
        },
        "& .MuiIconbutton-root": {
        color: `${isDarkMode ? "#a3a3a3" : ""}`,
        },
        "& .MuiTablePagination-root": {
        color: `${isDarkMode ? "#a3a3a3" : ""}`,
        },
        "& .MuiTablePagination-selectIcon": {
        color: `${isDarkMode ? "#a3a3a3" : ""}`,
        },
        "& .MuiDataGrid-cell": {
        border: "none",
        },
        "& .MuiDataGrid-row": {
        borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "e5e7eb"}`,
        },
        "& .MuiDataGrid-withBorderColor": {
        borderColor: `${isDarkMode ? "#2d3135" : "e5e7eb"}`,
        },
    };
};