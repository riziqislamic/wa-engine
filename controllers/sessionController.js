import { isSessionExists, createSession, getSession, deleteSession } from "./../whatsapp.js";
import response from "./../response.js";

const find = (req, res) => {
  if (isSessionExists(req.params.id)) {
    return response(res, 200, true, "Session found.");
  }

  response(res, 404, false, "Session not found.");
};

const add = (req, res) => {
  console.log("==================CREATE SESSION QR=================");
  const { id, isLegacy } = req.body;

  if (isSessionExists(id)) {
    deleteSession(id, isLegacy);
  }

  createSession(id, isLegacy === "true", res);
};

const del = async (req, res) => {
  const { id } = req.params;
  const session = getSession(id);

  if (session) {
    try {
      await session.logout();
    } catch {
    } finally {
      deleteSession(id, session.isLegacy);
    }
  }

  response(res, 200, true, "The session has been successfully deleted.");
};

export { find, add, del };
