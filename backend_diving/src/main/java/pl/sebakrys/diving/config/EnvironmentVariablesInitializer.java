package pl.sebakrys.diving.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.URL;

public class EnvironmentVariablesInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment env = applicationContext.getEnvironment();

        String datasourceUrl = env.getProperty("SPRING_DATASOURCE_URL");
        String datasourceUsername = env.getProperty("SPRING_DATASOURCE_USERNAME");
        String datasourcePassword = env.getProperty("SPRING_DATASOURCE_PASSWORD");
        String jwtSecret = env.getProperty("SPRING_DATASOURCE_JWT_SECRET");

        System.out.println("=== Wartosci zmiennych srodowiskowych ===");
        System.out.println("SPRING_DATASOURCE_URL: " + datasourceUrl);
        System.out.println("SPRING_DATASOURCE_USERNAME: " + datasourceUsername);
        System.out.println("SPRING_DATASOURCE_PASSWORD: " + datasourcePassword);
        System.out.println("SPRING_DATASOURCE_JWT_SECRET: " + jwtSecret);
        System.out.println("========================================");

        // Wyświetlenie adresów IP
        printIpAddresses();
    }


    private void printIpAddresses() {
        try {
            // Lokalny adres IP
            InetAddress localHost = InetAddress.getLocalHost();
            String localIpAddress = localHost.getHostAddress();
            System.out.println("Lokalny adres IP: " + localIpAddress);
        } catch (Exception e) {
            System.out.println("Nie udało się uzyskać lokalnego adresu IP");
            e.printStackTrace();
        }

        // Publiczny adres IP
        try {
            URL url = new URL("https://api.ipify.org");
            BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()));
            String publicIp = in.readLine();
            in.close();
            System.out.println("Publiczny adres IP: " + publicIp);
        } catch (Exception e) {
            System.out.println("Nie udało się uzyskać publicznego adresu IP");
            e.printStackTrace();
        }
    }

}