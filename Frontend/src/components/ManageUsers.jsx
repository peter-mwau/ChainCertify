import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const { api } = useAuth();
  
  useEffect(() => {
    // Fetch users from API or state management
    const fetchUsers = async () => {
      // Example fetch, replace with your API call
      const response = await api.get("/api/users");
      console.log("aLL USERS", response.data);
      setUsers(response.data);
    };

    fetchUsers();
  }, []);


  //delete user
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/api/users/${id}`);
      console.log(response);
      setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error(error);
        }
        };

  return (
    <div className="overflow-x-auto mx-auto container justify-center items-center">
      <h2 className="text-3xl font-bold mb-4 dark:text-gray-200">Manage Users</h2>
      <table className="min-w-full bg-white border border-gray-200 dark:bg-transparent shadow-md dark:shadow-white rounded-md">
        <thead className="dark:text-gray-300">
          <tr>
            <th className="py-2 px-4 border-b text-left">ID</th>
            <th className="py-2 px-4 border-b text-left">Names</th>
            <th className="py-2 px-4 border-b text-left">Role</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="border-b dark:text-gray-400">
              <td className="py-2 px-4">{user?.id}</td>
              <td className="py-2 px-4">{user?.name}</td>
              <td className="py-2 px-4">{user?.role}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
