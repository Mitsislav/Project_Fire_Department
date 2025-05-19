package incident;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import database.tables.EditIncidentsTable;
import mainClasses.Incident;

import java.util.ArrayList;
import java.util.HashMap;

import static spark.Spark.*;

public class IncidentRESTAPI {
    private static final Gson gson = new Gson();
    private static final EditIncidentsTable incidentTable = new EditIncidentsTable();

    public static void main(String[] args){
        port(4567); /* */

        post("/incident", (req, res) -> {
            res.type("application/json");
            Incident incident = gson.fromJson(req.body(), Incident.class);

            try {

                if (incident.getAddress() == null || incident.getMunicipality() == null || incident.getPrefecture() == null) {
                    res.status(400);
                    return gson.toJson(new StandardResponse("Missing address, municipality, or prefecture."));
                }

                incident.setUser_type("guest");
                incident.setStart_datetime();

                incidentTable.createNewIncident(incident);
                res.status(200);
                return gson.toJson(new StandardResponse("Incident submitted successfully"));
            } catch (Exception e) {
                res.status(406);
                return gson.toJson(new StandardResponse("Invalid input or database error"));
            }
        });


        /* getting all the incidents specific type and status  */
        get("/incidents/:type/:status", (req, res) -> {
            res.type("application/json");
            String type = req.params(":type");
            String status = req.params(":status");

            /* optional , if there is not then pick from all */
            String municipality = req.queryParams("municipality");
            if (municipality == null) municipality = "all";

            try{
                /*  taking the list with desired incidents */
                ArrayList<Incident> incidents = incidentTable.databaseToIncidentsSearch(type, status, municipality);

                Gson gson = new Gson();
                /* convert to JSON form and return it to ajax */
                if(incidents != null && !incidents.isEmpty()){
                    JsonElement data = gson.toJsonTree(incidents);
                    res.status(200);
                    return gson.toJson(new StandardResponse(data));
                }else{
                    res.status(403);
                    return gson.toJson(new StandardResponse("No incidents found with these params"));
                }

            }catch(Exception e){
                res.status(500);
                return gson.toJson(new StandardResponse("Problem at database"));
            }
        });

        /* update the status and the end-time of the incident */
        put("/incidentStatus/:id/:status", (req, res) ->{
            res.type("application/json");
            String incidentId = req.params(":id");
            String status = req.params(":status");

            HashMap<String, String> updates = new HashMap<>();
            updates.put("status", status);

            /* if submitted then get the start datetime again and set null to end date-time*/
            if(status.equals("submitted")){
                updates.put("start_datetime", java.time.LocalDateTime.now().toString().replace("T", " "));
                updates.put("end_datetime",null);
            }else if(status.equals("finished")){
                updates.put("end_datetime", java.time.LocalDateTime.now().toString().replace("T", " "));
            }

            try{
                /* checks if there is this incident with this id */
                boolean exists = incidentTable.incidentExists(incidentId);
                if(!exists){
                    res.status(403);
                    return gson.toJson(new StandardResponse("Incident ID does not exist"));
                }

                incidentTable.updateIncident(incidentId, updates);
                res.status(200);
                return gson.toJson(new StandardResponse("Incident status updated successfully"));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(new StandardResponse("Database error"));
            }
        });

        /* delete an incident by id */
        delete("/incidentDeletion/:id", (req, res) -> {
            res.type("application/json");
            String incidentId = req.params(":id");

            try {
                /* checks if there is incident with this id */
                boolean exists = incidentTable.incidentExists(incidentId);
                if(!exists){
                    res.status(403);
                    return gson.toJson(new StandardResponse("Incident ID does not exist"));
                }

                incidentTable.deleteIncident(incidentId);
                res.status(200);
                return gson.toJson(new StandardResponse("Incident deleted successfully"));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(new StandardResponse("Database error"));
            }
        });

        get("/", (req, res) ->{
            res.type("text/html");
            return "<h1>Incident REST API is running!</h1>";
        });

        System.out.println("Incident API is running on http://localhost:4567/");
    }
}
