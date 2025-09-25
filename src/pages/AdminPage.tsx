
import React, { useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "../firebaseClient"; // importa tu firebaseClient

const AdminSetup = () => {
  useEffect(() => {
    const assignAdmin = async () => {
      try {
        const functions = getFunctions(app);
        const makeAdmin = httpsCallable(functions, "makeAdmin");
        const result = await makeAdmin({});
        console.log(result.data.message);
        alert(result.data.message); // mensaje en pantalla
      } catch (err: any) {
        console.error(err.message);
        alert("Error al asignar admin: " + err.message);
      }
    };

    assignAdmin();
  }, []);

  return <div>Asignando permisos de admin...</div>;
};

export default AdminSetup;
