import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
      <h1 className="text-5xl font-bold mb-6">
        Welcome to JustToDo
      </h1>

      <p className="text-xl mb-8 text-center max-w-xl">
        Organize your tasks, mark priorities and stay productive.
      </p>

      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-white text-indigo-700 rounded-xl shadow-lg hover:scale-105 transition"
      >
        Login
      </button>
    </div>
  );
}

export default Home;
