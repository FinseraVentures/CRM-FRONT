
import { apiUrl } from "./LoginSignup";
 const Mailer = (dataToSubmit) => {
  fetch(`${apiUrl}/mail/api/welcome`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSubmit),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Error creating booking");
    }
    return response.json();
  });
};

export default Mailer;