import { useState, useEffect } from "react";
import axios from "axios";
import Button from "./components/Button";
import "./App.css";

interface TodoType {
  id: number;
  task: string;
  done: boolean;
  content: string;
}

const App = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [inputTask, setInputTask] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");
  const [editField, setEditField] = useState<TodoType | null>(null);

  //function to add Task
  const handleAddTask = async () => {
    try {
      const { data } = await axios.post(
        "https://api.todoist.com/rest/v2/tasks",
        { content: inputTask },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        }
      );
      setTodos((prevTodos) => [data, ...prevTodos]);
      alert("Data Task Berhasil Ditambahkan");
      setInputTask("");
      localStorage.setItem("todos", JSON.stringify([...todos, data]));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const storageTodos = localStorage.getItem("todos");
    if (storageTodos) {
      setTodos(JSON.parse(storageTodos));
    }
  }, []);

  //function to delete Task
  const handleDeleteTask = async (id: Number) => {
    try {
      await axios.delete(`https://api.todoist.com/rest/v2/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      });
      if (window.confirm("Are You Sure want to delete this task?")) {
        setTodos((prevTodos) => prevTodos.filter((item) => item.id !== id));
        localStorage.setItem(
          "todos",
          JSON.stringify(todos.filter((item) => item.id !== id))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          "https://api.todoist.com/rest/v2/tasks",
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            },
          }
        );
        setTodos(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  //function to handle completed task
  function handleCompleteTask(todo: TodoType) {
    const newTodos = [...todos];
    const index = newTodos.findIndex((item) => item.id === todo.id);

    newTodos[index].done = !newTodos[index].done;
    setTodos(newTodos);
  }

  //function to handle search query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  //function to handle edit
  const handleEdit = (todo: TodoType) => {
    setEditField(todo);
    setInputTask(todo.content);
  };

  //function to handle update after click edit
  const handleUpdateClick = (id: number) => {
    const updatedTodos = todos.map((item) => {
      if (item.id === id) {
        setInputTask("");
        return { ...item, content: inputTask };
      }
      return item;
    });
    setTodos(updatedTodos);
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
    setEditField(null);
  };

  //styling inline
  const mainContainer = {
    width: "100%",
    height: "100%",
    maxWidth: "100vh",
    maxHeight: "100vh",
  };

  const TitleApp = {
    marginTop: "2rem",
    marginBottom: "2rem",
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: "1.5em",
  };

  const AddButtonStyle = {
    marginTop: "1rem",
    marginBottom: "2rem",
    width: "50%",
  };

  const updateClickStyle = {
    width: "50%",
    margin: "0 auto",
  };

  const handleEditStyle = {
    marginTop: "1.5rem",
  };

  const deleteStyle = {
    marginTop: "1.5rem",
    marginBottom: "2rem",
  };

  return (
    <div
      className="w-full h-screen dark:bg-gray-600 bg-white flex flex-col overflow-auto"
      style={mainContainer}
    >
      <div className="w-full h-screen h-full w-full overflow-auto p-2">
        <div>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="search Tasks..."
            className="input input-bordered w-full max-w-xs"
          />
        </div>

        <h1 style={TitleApp}>Todo List App</h1>

        <input
          id="input-task"
          value={inputTask}
          onChange={(e) => {
            setInputTask(e.target.value);
          }}
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
        />

        <Button
          label="Add Task"
          onClick={() => handleAddTask()}
          disabled={inputTask === ""}
          style={AddButtonStyle}
        />
        {todos
          .filter((todo) => todo.content.includes(searchValue))
          .map((todo) => (
            <div key={todo.id} className="todo-result">
              <h2 className="task-head" style={{ margin: "0 auto" }}>
                Task {todo.id}
              </h2>
              <p className={todo.done ? "todo-done" : "task_styling"}>
                {todo.content}
              </p>
              <div className="flex flex-col overflow-auto">
                <Button
                  label="Complete"
                  onClick={() => handleCompleteTask(todo)}
                  className="btn-task"
                  style={{ margin: "0 auto" }}
                />
                {editField && editField.id === todo.id ? (
                  <>
                    <textarea
                      value={inputTask}
                      onChange={(e) => {
                        setInputTask(e.target.value);
                      }}
                      placeholder="update todo content"
                    />
                    <button
                      onClick={() => handleUpdateClick(todo.id)}
                      style={updateClickStyle}
                    >
                      Update
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      label="Edit"
                      onClick={() => handleEdit(todo)}
                      className="btn-task"
                      style={handleEditStyle}
                    />
                  </>
                )}

                <Button
                  label="Hapus"
                  onClick={() => handleDeleteTask(todo.id)}
                  className="btn-task"
                  style={deleteStyle}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default App;
