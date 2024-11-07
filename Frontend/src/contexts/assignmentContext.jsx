import React from "react";

export const AssignmentContext = React.createContext({
	assignment: null,
	setAssignment: () => {},
});