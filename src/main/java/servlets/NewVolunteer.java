package servlets;

import database.tables.EditUsersTable;
import database.tables.EditVolunteersTable;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;


public class NewVolunteer extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        System.out.println("Heyyy");
        /* set response content type */
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        /* read JSON from request body */
        StringBuilder jsonBuilder = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }
        }
        String jsonInput = jsonBuilder.toString();

        System.out.println(jsonInput);

        /* process the JSON data */
        EditVolunteersTable eut = new EditVolunteersTable();
        try {
            eut.addVolunteerFromJSON(jsonInput);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"Failed to add volunteer!\"}");
            return;
        }

        /* Send success response back to frontend */
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write("{\"message\": \"Volunteer added successfully!\"}");
    }
}