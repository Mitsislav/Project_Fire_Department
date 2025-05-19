package servlets.newOne;

import com.google.gson.Gson;
import database.tables.EditIncidentsTable;
import database.tables.EditParticipantsTable;
import mainClasses.Incident;
import mainClasses.Participant;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class HistoryIncidentsServlet extends HttpServlet
{
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        EditParticipantsTable participantsTable = new EditParticipantsTable();
        EditIncidentsTable incidentsTable = new EditIncidentsTable();
        List<Incident> acceptedIncidents = new ArrayList<>();

        try {
            // Fetch all participants with status 'accepted'
            ArrayList<Participant> acceptedParticipants = participantsTable.databaseToAcceptedParticipants();

            for (Participant participant : acceptedParticipants) {
                int incidentId = participant.getIncident_id();

                // Get the incident details using incident_id
                Incident incident = incidentsTable.databaseToIncident(incidentId);
                if (incident != null) {
                    acceptedIncidents.add(incident);
                }
            }

            // Convert the list to JSON and send response
            String jsonResponse = new Gson().toJson(acceptedIncidents);
            PrintWriter out = response.getWriter();
            out.print(jsonResponse);
            out.flush();

        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Error retrieving incidents.\"}");
        }
    }
}