import { useState, useEffect } from "react";
import {
  FaPlus,
  FaSun,
  FaMoon,
  FaDesktop,
  FaChartLine,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";
import { Toaster, toast } from 'react-hot-toast';
import TodoItem from "./components/TodoItem";
import AddTodoModal from "./components/AddTodoModal";
import ProductivityModal from "./components/ProductivityModal";
import UndoToast from "./components/UndoToast";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import AuthComponent from "./components/Auth";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import styles from "./App.module.css";

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  user_id: string;
  image_url?: string;
}

interface DeletedTodo {
  todo: Todo;
  timeoutId: number;
}

export interface ProductivityData {
  date: string;
  completed: number;
  user_id: string;
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
  const { session, signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductivityOpen, setIsProductivityOpen] = useState(false);
  const [filter, setFilter] = useState<"active" | "completed">("active");
  const [deletedTodo, setDeletedTodo] = useState<DeletedTodo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (session) {
      fetchTodos();
      fetchProductivityData();
    }
  }, [session]);

  useEffect(() => {
    // Handle authentication redirect and hash parameters
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // If we have an access token, ensure we're on the correct origin
      const targetOrigin = window.location.hostname.includes('vercel.app')
        ? 'https://tracker-theta-woad.vercel.app'
        : `${window.location.protocol}//${window.location.hostname}:5173`;
        
      if (window.location.origin !== targetOrigin) {
        window.location.href = `${targetOrigin}${window.location.pathname}${hash}`;
      }
    }
  }, []);

  const fetchTodos = async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('createdAt', { ascending: false });

    if (error) {
      toast.error('Error fetching todos');
      return;
    }

    // Фильтруем удаляемую задачу из полученных данных
    const filteredData = data?.filter(todo => 
      !deletedTodo || todo.id !== deletedTodo.todo.id
    ) || [];

    setTodos(filteredData);
  };

  const fetchProductivityData = async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from('productivity')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Error fetching productivity data');
      return;
    }
    setProductivityData(data || []);
  };

  const updateProductivityData = async (completed: boolean) => {
    if (!session) return;

    const today = new Date().toISOString().split("T")[0];
    const existingData = productivityData.find((item) => item.date === today);

    if (existingData) {
      const { error } = await supabase
        .from('productivity')
        .update({ completed: existingData.completed + (completed ? 1 : -1) })
        .eq('date', today)
        .eq('user_id', session.user.id);

      if (error) {
        toast.error('Error updating productivity data');
        return;
      }
    } else {
      const { error } = await supabase
        .from('productivity')
        .insert([{ date: today, completed: 1, user_id: session.user.id }]);

      if (error) {
        toast.error('Error creating productivity data');
        return;
      }
    }

    fetchProductivityData();
  };

  const addTodo = async (title: string, description: string, imageUrl?: string) => {
    if (!session) return;

    const newTodo = {
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
      user_id: session.user.id,
      image_url: imageUrl
    };

    const { data, error } = await supabase.from('todos').insert([newTodo]).select();

    if (error) {
      toast.error('Error creating todo');
      return;
    }

    // Обновляем список задач, учитывая удаляемую задачу
    setTodos(prevTodos => {
      // Фильтруем удаляемую задачу из списка, если она есть
      const filteredTodos = prevTodos.filter(todo => 
        !deletedTodo || todo.id !== deletedTodo.todo.id
      );
      // Добавляем новую задачу
      return [...filteredTodos, data[0]];
    });

    toast.success('Task created successfully!');
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) {
      toast.error('Error updating todo');
      return;
    }

    updateProductivityData(!todo.completed);
    fetchTodos();
    toast.success(todo.completed ? 'Task marked as active!' : 'Task completed!');
  };

  const deleteTodo = async (id: string) => {
    // Находим задачу, которую нужно удалить
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;

    // Если уже есть удаленная задача, очищаем ее состояние
    if (deletedTodo) {
      clearTimeout(deletedTodo.timeoutId);
      try {
        await supabase.from('todos').delete().eq('id', deletedTodo.todo.id);
      } catch (error) {
        console.error('Error deleting previous todo:', error);
      }
    }

    // Удаляем задачу из UI немедленно
    setTodos(prevTodos => prevTodos.filter(t => t.id !== id));
    setIsDeleting(true);

    // Создаем новый таймаут для окончательного удаления
    const timeoutId = window.setTimeout(async () => {
      try {
        const { error } = await supabase.from('todos').delete().eq('id', id);
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
        toast.error('Error deleting todo');
        // Возвращаем задачу в список при ошибке
        setTodos(prevTodos => [...prevTodos, todoToDelete]);
      }
      setDeletedTodo(null);
      setIsDeleting(false);
    }, 5000);

    // Сохраняем информацию об удаленной задаче
    setDeletedTodo({ todo: todoToDelete, timeoutId });
  };

  const handleUndoDelete = () => {
    if (!deletedTodo) return;

    // Очищаем таймаут удаления
    clearTimeout(deletedTodo.timeoutId);

    // Возвращаем задачу в список
    setTodos(prevTodos => [...prevTodos, deletedTodo.todo]);
    
    // Очищаем информацию об удаленной задаче
    setDeletedTodo(null);
    setIsDeleting(false);
    
    toast.success('Task restored successfully!');
  };

  const handleDeleteComplete = () => {
    if (deletedTodo) {
      clearTimeout(deletedTodo.timeoutId);
    }
    setDeletedTodo(null);
    setIsDeleting(false);
  };

  // Очищаем таймаут при размонтировании компонента
  useEffect(() => {
    return () => {
      if (deletedTodo) {
        clearTimeout(deletedTodo.timeoutId);
      }
    };
  }, [deletedTodo]);

  const editTodo = async (id: string, title: string, description: string, imageUrl?: string) => {
    const { error } = await supabase
      .from('todos')
      .update({ title, description, image_url: imageUrl })
      .eq('id', id);

    if (error) {
      toast.error('Error updating todo');
      return;
    }

    fetchTodos();
  };

  if (!session) {
    return <AuthComponent />;
  }

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
          <ThemeToggle />
          <button
            className={styles.signOutButton}
            onClick={signOut}
            title="Sign Out"
          >
            <FaSignOutAlt />
          </button>
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
              imageUrl={todo.image_url}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              isDeleting={isDeleting}
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

      {deletedTodo && (
        <UndoToast
          onUndo={handleUndoDelete}
          onComplete={handleDeleteComplete}
          duration={5000}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Handle authentication redirect and hash parameters
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // If we have an access token, ensure we're on the correct origin
      const targetOrigin = window.location.hostname.includes('vercel.app')
        ? 'https://tracker-theta-woad.vercel.app'
        : `${window.location.protocol}//${window.location.hostname}:5173`;
        
      if (window.location.origin !== targetOrigin) {
        window.location.href = `${targetOrigin}${window.location.pathname}${hash}`;
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
