export function getCurrentUserId() {
  const userId = localStorage.getItem("userId");
  return userId;
}

export async function loginUser(username, password) {
  try {
    const response = await fetch(
      `http://localhost:3000/users?username=${username}&password=${password}`
    );

    const user = await response.json();

    if (user.length > 0) {
      const matchedUser = user[0];
      localStorage.setItem("userId", matchedUser.id);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return false;
  }
}

export function logoutUser() {
  localStorage.removeItem("userId");
}

