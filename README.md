# Funnel 
A cone-shaped utensil with a tube at the apex for conducting data from volume to volume.

##Purpose
Funnel is meant to do one thing and one thing only. Act as a funnel for Kubernetes volumes.
The author found that adding configuration to containers led to unexpected surprises.
For instance, some applications do not read symbolic links. As a result Kubernetes ConfigMap volumes do not get read by that application.

##Usage
Funnel is to be used as an `init-container`. 

Volumes 'from' which files are to be conducted should be mounted in `/usr/src/app/from/`.
Volumes 'to' which files are to be conducted should be mounted in `/usr/src/app/to/`.

##Procedure
Funnel picks up **all** paths from `/usr/src/app/from/**` and maps them to `/usr/src/app/to/**`.
This means you can use sub-paths in `/usr/src/app/from/` and direct them to a specific sub-path in `/usr/src/app/to/`.
For example, `/usr/src/app/from/my_awesome_app_without_symlink_reading/` is mapped to `/usr/src/app/to/my_awesome_app_without_symlink_reading/`.
Then, a regular container can use the volume with mountPath `/usr/src/app/to/my_awesome_app_without_symlink_reading/`

###Examples
Funnel is mainly intended to map ConfigMaps to PersistentVolumes. 
Many permutations are possible. Some are listed below.
####ConfigMap to PersistentVolume (root-root)
````yaml
apiVersion: apps/v1 # for versions before 1.9.0 use apps/v1beta2
kind: Deployment
metadata:
  name: my_awesome_app_without_symlink_reading-deployment
  labels:
    app: my_awesome_app_without_symlink_reading
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my_awesome_app_without_symlink_reading
  template:
    metadata:
      labels:
        app: my_awesome_app_without_symlink_reading
    spec:
      initContainers:
      - name: funnel
        volumeMounts:
        - mountPath: /usr/src/app/from/
          name: configmap-volume
        - mountPath: /user/src/app/to/
          name: persistent-volume
      containers:
      - name: my_awesome_app_without_symlink_reading
        image: my_awesome_app_without_symlink_reading:1.0.0
      volumes:
      - name: configmap-volume
        configMap:
          name: configmap
      - name: persistent-volume
        persistentVolumeClaim:
          claimName: alimony
````
#### ConfigMap to PersistentVolume (root-subpath)
````yaml
apiVersion: apps/v1 # for versions before 1.9.0 use apps/v1beta2
kind: Deployment
metadata:
  name: my_awesome_app_without_symlink_reading-deployment
  labels:
    app: my_awesome_app_without_symlink_reading
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my_awesome_app_without_symlink_reading
  template:
    metadata:
      labels:
        app: my_awesome_app_without_symlink_reading
    spec:
      initContainers:
      - name: funnel
        volumeMounts:
        - mountPath: /usr/src/app/from/
          name: configmap-volume
        - mountPath: /user/src/app/to/
          name: persistent-volume
          subPath: /away/from/root/we/go/
      containers:
      - name: my_awesome_app_without_symlink_reading
        image: my_awesome_app_without_symlink_reading:1.0.0
      volumes:
      - name: configmap-volume
        configMap:
          name: configmap
      - name: persistent-volume
        persistentVolumeClaim:
          claimName: i-am-root
````

##Trivia
- When moving a liquid from one container to another container one often uses a funnel so the liquid does not spill.
- Funneling is a term used for the allocation of a resource. For instance, 'The company was funneling all income towards the R&D department.'.
- Volume is the quantity of three-dimensional space enclosed by a closed surface. Otherwise know as a container.