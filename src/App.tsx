import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSun,
  FaMoon,
  FaDesktop,
  FaCog,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";
import { Toaster, toast } from 'react-hot-toast';
import TodoItem from "./components/TodoItem";
import AddTodoModal from "./components/AddTodoModal";
import ProductivityModal from "./components/ProductivityModal";
import SettingsPopup from "./components/SettingsPopup";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import styles from "./App.module.css";

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

interface ProductivityData {
  date: string;
  completed: number;
}

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = () => {
    const newTheme =
      theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(newTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <FaSun />;
      case "dark":
        return <FaMoon />;
      default:
        return <FaDesktop />;
    }
  };

  return (
    <button className={styles.themeToggle} onClick={handleThemeChange}>
      {getThemeIcon()}
    </button>
  );
};

const AppContent: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [productivityData, setProductivityData] = useState<ProductivityData[]>(
    () => {
      const savedData = localStorage.getItem("productivityData");
      return savedData ? JSON.parse(savedData) : [];
    }
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductivityOpen, setIsProductivityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<"active" | "completed">("active");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("productivityData", JSON.stringify(productivityData));
  }, [productivityData]);

  const updateProductivityData = (completed: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    const existingData = productivityData.find((item) => item.date === today);

    if (existingData) {
      setProductivityData(
        productivityData.map((item) =>
          item.date === today
            ? { ...item, completed: item.completed + (completed ? 1 : -1) }
            : item
        )
      );
    } else {
      setProductivityData([...productivityData, { date: today, completed: 1 }]);
    }
  };

  const addTodo = (title: string, description: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos([...todos, newTodo]);
    toast.success('Task created successfully!', {
      style: {
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
        border: '1px solid var(--border-color)',
      },
      iconTheme: {
        primary: 'var(--primary-color)',
        secondary: 'white',
      },
    });
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const newCompleted = !todo.completed;
          updateProductivityData(newCompleted);
          toast.success(
            newCompleted ? 'Task completed!' : 'Task marked as active!',
            {
              style: {
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
              },
              iconTheme: {
                primary: 'var(--primary-color)',
                secondary: 'white',
              },
            }
          );
          return { ...todo, completed: newCompleted };
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (todoToDelete) {
      setTodos(todos.filter((todo) => todo.id !== id));
      toast.success('Task deleted successfully!', {
        style: {
          background: 'var(--card-bg)',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
        },
        iconTheme: {
          primary: '#f44336',
          secondary: 'white',
        },
      });
    }
  };

  const editTodo = (id: string, title: string, description: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, title, description } : todo
      )
    );
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    return todo.completed;
  });

  const getTaskCount = (type: "all" | "active" | "completed") => {
    switch (type) {
      case "all":
        return todos.length;
      case "active":
        return todos.filter((todo) => !todo.completed).length;
      case "completed":
        return todos.filter((todo) => todo.completed).length;
    }
  };

  const handleClearData = () => {
    localStorage.clear();
    setTodos([]);
    setProductivityData([]);
    toast.success('All data cleared successfully!', {
      style: {
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
        border: '1px solid var(--border-color)',
      },
      iconTheme: {
        primary: '#f44336',
        secondary: 'white',
      },
    });
  };

  return (
    <div className={styles.app}>
      <Toaster position="top-center" />
      <header className={styles.header}>
        <h1 className={styles.title}>Tracker</h1>
        <div className={styles.headerRight}>
          <button
            className={styles.statsButton}
            onClick={() => setIsProductivityOpen(true)}
            title="Productivity Stats"
          >
            <FaChartLine />
          </button>
          <button
            className={styles.settingsButton}
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            <FaCog />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${
            filter === "active" ? styles.active : ""
          }`}
          onClick={() => setFilter("active")}
        >
          Active{" "}
          <span className={styles.counter}>{getTaskCount("active")}</span>
        </button>
        <button
          className={`${styles.filterButton} ${
            filter === "completed" ? styles.active : ""
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed{" "}
          <span className={styles.counter}>{getTaskCount("completed")}</span>
        </button>
      </div>

      <div className={styles.todoList}>
        {filteredTodos.length === 0 ? (
          <div className={styles.emptyState}>
            <FaClipboardList size={48} />
            <p className={styles.emptyText}>No tasks found</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              title={todo.title}
              description={todo.description}
              completed={todo.completed}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))
        )}
      </div>

      <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
        <FaPlus />
      </button>

      <AddTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTodo}
      />

      <ProductivityModal
        isOpen={isProductivityOpen}
        onClose={() => setIsProductivityOpen(false)}
        data={productivityData}
      />

      <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={handleClearData}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
