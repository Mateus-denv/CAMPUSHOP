package br.com.campushop.campushop_backend.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class LocalDateDeserializer extends JsonDeserializer<LocalDate> {

    private static final DateTimeFormatter[] FORMATTERS = {
        DateTimeFormatter.ISO_LOCAL_DATE,           // YYYY-MM-DD
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),  // DD/MM/YYYY
        DateTimeFormatter.ofPattern("dd-MM-yyyy"),  // DD-MM-YYYY
    };

    @Override
    public LocalDate deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
            throws IOException {
        String date = jsonParser.getText();
        
        if (date == null || date.trim().isEmpty()) {
            return null;
        }

        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDate.parse(date.trim(), formatter);
            } catch (DateTimeParseException e) {
                // Tenta o próximo formato
            }
        }

        throw new IOException("Data inválida: " + date + ". Use YYYY-MM-DD, DD/MM/YYYY ou DD-MM-YYYY");
    }
}
