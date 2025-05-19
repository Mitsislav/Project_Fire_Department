package servlets.newOne;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.tables.EditParticipantsTable;
import mainClasses.Participant;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;

public class ParticipantsServlet extends HttpServlet
{
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            EditParticipantsTable participantsTable = new EditParticipantsTable();
            ArrayList<Participant> participants = participantsTable.databaseToParticipants(); // Fetch all participation requests

            Gson gson = new Gson();
            String json = gson.toJson(participants);
            response.getWriter().write(json);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"Error fetching requests\"}");
        }
    }


    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        JsonObject jsonResponse = new JsonObject();

        try (BufferedReader reader = request.getReader()) {
            Gson gson = new Gson();
            Participant newParticipant = gson.fromJson(reader, Participant.class);

            EditParticipantsTable participantsTable = new EditParticipantsTable();
            participantsTable.createNewParticipant(newParticipant);

            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Request submitted successfully.");
            response.getWriter().write(jsonResponse.toString());

        } catch (Exception e) {
            e.printStackTrace();  // Log the full error in server logs
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Error processing request.");
            response.getWriter().write(jsonResponse.toString());
        }
    }
}