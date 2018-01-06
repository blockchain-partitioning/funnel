# Funnel 
A cone-shaped utensil with a tube at the apex for conducting data from volume to volume.

## Purpose
Funnel is meant to do one thing and one thing only. Act as a funnel for Kubernetes volumes.
The author found that adding configuration to containers led to unexpected surprises.
For instance, some applications do not read symbolic links. As a result Kubernetes ConfigMap volumes do not get read by that application.

## Usage
Funnel is to be used as an `init-container`. 

Volumes 'from' which files are to be conducted should be mounted in `/usr/src/app/from/`.
Volumes 'to' which files are to be conducted should be mounted in `/usr/src/app/to/`.

## Procedure
Funnel picks up **all** paths from `/usr/src/app/from/**` and maps them to `/usr/src/app/to/**`.
This means you can use sub-paths in `/usr/src/app/from/` and direct them to a specific sub-path in `/usr/src/app/to/`.
For example, `/usr/src/app/from/my-awesome-app-without-symlink-reading/` is mapped to `/usr/src/app/to/my-awesome-app-without-symlink-reading/`.
Then, a regular container can use the volume with mountPath `/usr/src/app/to/my-awesome-app-without-symlink-reading/`

### Examples
Funnel is mainly intended to map ConfigMaps to PersistentVolumes. 
Many permutations are possible. Some are listed below.
#### ConfigMap to PersistentVolume (root-root)
````yaml
apiVersion: apps/v1beta2 # for versions before 1.9.0 use apps/v1beta2
kind: Deployment
metadata:
  name: my-awesome-app-without-symlink-reading-deployment
  labels:
    app: my-awesome-app-without-symlink-reading
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-awesome-app-without-symlink-reading
  template:
    metadata:
      labels:
        app: my-awesome-app-without-symlink-reading
    spec:
      initContainers:
      - name: funnel
        image: robertdiebels/funnel
        volumeMounts:
        - mountPath: /usr/src/app/from/
          name: configmap-volume
        - mountPath: /usr/src/app/to/
          name: persistent-volume
      containers:
      - name: myapp-container
        image: busybox
        command: ['sh', '-c','echo "There should be something below this sentence"; ls /opt/share/config; echo "There should be nothing below this sentence."; ls -lR /opt/share/config | grep ^l']
        volumeMounts:
        - mountPath: /opt/share/config
          name: persistent-volume
      volumes:
      - name: configmap-volume
        configMap:
          name: from-config
      - name: persistent-volume
        persistentVolumeClaim:
          claimName: alimony
---

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 name: alimony
spec:
 accessModes:
   - ReadWriteMany
 resources:
   requests:
     storage: 10Mi
---
````
#### ConfigMap to PersistentVolume (root-subpath)
````yaml
apiVersion: apps/v1beta2 # for versions before 1.9.0 use apps/v1beta2
kind: Deployment
metadata:
  name: my-awesome-app-without-symlink-reading-deployment
  labels:
    app: my-awesome-app-without-symlink-reading
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-awesome-app-without-symlink-reading
  template:
    metadata:
      labels:
        app: my-awesome-app-without-symlink-reading
    spec:
      initContainers:
      - name: funnel
        image: robertdiebels/funnel
        volumeMounts:
        - mountPath: /usr/src/app/from/
          name: configmap-volume
        - mountPath: /usr/src/app/to/
          name: persistent-volume
          subPath: /away/from/root/we/go/
      containers:
      - name: myapp-container
        image: busybox
        command: ['sh', '-c','echo "There should be something below this sentence"; ls /opt/share/config; echo "There should be nothing below this sentence."; ls -lR /opt/share/config | grep ^l']
        volumeMounts:
        - mountPath: /opt/share/config
          name: persistent-volume
          subPath: /away/from/root/we/go/
      volumes:
      - name: configmap-volume
        configMap:
          name: from-config
      - name: persistent-volume
        persistentVolumeClaim:
          claimName: i-am-root
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 name: i-am-root
spec:
 accessModes:
   - ReadWriteMany
 resources:
   requests:
     storage: 10Mi
````

## Trivia
- When moving a liquid from one container to another container one often uses a funnel so the liquid does not spill.
- Funneling is a term used for the allocation of a resource. For instance, 'The company was funneling all income towards the R&D department.'.
- Volume is the quantity of three-dimensional space enclosed by a closed surface. Closed surfaces are otherwise known as containers.