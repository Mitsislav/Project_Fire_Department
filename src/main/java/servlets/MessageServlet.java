package servlets;

import com.google.gson.Gson;
import database.tables.EditMessagesTable;
import jakarta.mail.MessageAware;
import mainClasses.Message;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Objects;

public class MessageServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String username = request.getParameter("username");
        String incident_id = request.getParameter("incident_id");

        try {
            int incidentId = Integer.parseInt(incident_id);

            EditMessagesTable messagesTable = new EditMessagesTable();
            ArrayList<Message> messages=null;
            System.out.println(username);

            if(!Objects.equals(username, "admin") ) {
                messages = messagesTable.getMessagesByUser(username, incidentId);

            }else{
                messages = messagesTable.databaseToMessage(incidentId);
            }

            Gson gson = new Gson();
            String json = gson.toJson(messages);
            response.getWriter().write(json);

            System.out.println("retrieve the messages...");
            System.out.println(json);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"Error fetching messages\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            Message newMessage = gson.fromJson(reader, Message.class);
            newMessage.setDate_time();

            EditMessagesTable messagesTable = new EditMessagesTable();

            messagesTable.createNewMessage(newMessage);

            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write("{\"message\": \"Message sent successfully.\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"Error sending message.\"}");
        }
    }
}