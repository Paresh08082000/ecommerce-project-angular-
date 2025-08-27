package com.example.ecommerce.config;

import com.example.ecommerce.entity.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.core.mapping.ExposureConfigurer;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {

  @Value("${allowed.origins}")
  private String[] allowedOrigins;

  private EntityManager entityManager;

  @Autowired
  public MyDataRestConfig(EntityManager theentityManager){
    entityManager = theentityManager;
  }
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
      HttpMethod[] unsupportedActions = {HttpMethod.PUT, HttpMethod.POST, HttpMethod.DELETE, HttpMethod.PATCH};
      disableHttpMethods(config.getExposureConfiguration()
          .forDomainType(Product.class), unsupportedActions);
      disableHttpMethods(config.getExposureConfiguration()
          .forDomainType(ProductCategory.class), unsupportedActions);
      disableHttpMethods(config.getExposureConfiguration()
          .forDomainType(Country.class), unsupportedActions);
      disableHttpMethods(config.getExposureConfiguration()
          .forDomainType(State.class), unsupportedActions);
      disableHttpMethods(config.getExposureConfiguration()
      .forDomainType(Order.class), unsupportedActions);

      // Call an internal method to expose ids
      exposeIds(config);

      // configure CORS
      cors.addMapping(config.getBasePath() + "/**")
          .allowedOrigins(allowedOrigins);
    }

  // Disable HTTP methods: PUT, POST, DELETE
  private static void disableHttpMethods(ExposureConfigurer config, HttpMethod[] unsupportedActions) {
    config
        .withItemExposure((metadata, httpMethods) -> httpMethods.disable(unsupportedActions))
        .withCollectionExposure((metadata, httpMethods) -> httpMethods.disable(unsupportedActions));
  }

  //call Internal method to expose ids
  void exposeIds(RepositoryRestConfiguration config){
    // Get a list of all entity classes from the entity manager
    Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();

    List<Class> entityClasses = new ArrayList<>();

    // Get the entity types and add them to the list
    for(EntityType entityType : entities) {
      entityClasses.add(entityType.getJavaType());
    }

    // Convert the list to an array and expose the ids for the entity classes
    Class[] domainTypes = entityClasses.toArray(new Class[0]);
    config.exposeIdsFor(domainTypes);
  }

}
