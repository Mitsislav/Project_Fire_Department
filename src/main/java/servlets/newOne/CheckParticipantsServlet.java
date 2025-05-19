package servlets.newOne;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.tables.EditParticipantsTable;
import mainClasses.Participant;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;

public class CheckParticipantsServlet extends HttpServlet
{
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String volunteerUsername = request.getParameter("volunteer_username");
        String incidentIdStr = request.getParameter("incident_id");

        JsonObject jsonResponse = new JsonObject();
        ArrayList<Participant> userRequests = new ArrayList<>();

        try {
            if (volunteerUsername == null || incidentIdStr == null) {
                jsonResponse.addProperty("error", "Missing parameters");
                response.getWriter().write(jsonResponse.toString());
                return;
            }

            int incidentId = Integer.parseInt(incidentIdStr);

            // Fetch all participation requests
            EditParticipantsTable participantsTable = new EditParticipantsTable();
            ArrayList<Participant> participants = participantsTable.databaseToParticipants();

            // Filter only the requests for this volunteer and incident
            for (Participant p : participants) {
                if (p.getVolunteer_username().equals(volunteerUsername) &&
                        p.getIncident_id() == incidentId &&
                        p.getStatus().equals("requested")) {
                    userRequests.add(p);
                }
            }

            Gson gson = new Gson();
            String jsonResponseString = gson.toJson(userRequests);
            System.out.println("Returning from CheckParticipants: " + jsonResponseString); // Debugging
            response.getWriter().write(jsonResponseString);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("[]"); // Return empty array on error
        }
    }
}
