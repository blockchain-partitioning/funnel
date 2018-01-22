# Funnel 
A cone-shaped utensil with a tube at the apex for conducting data from volume to volume.

## Purpose
Funnel is meant to do one thing and one thing only. Act as a funnel between Kubernetes volumes.
The author found that adding configuration to containers led to unexpected surprises.
For instance, some applications do not read symbolic links. As a result Kubernetes ConfigMap volumes do not get read by said applications.

### Pros
The functionality offered by funnel has several benefits, they are listed below:
1. Funnel allows a Kubernetes user to mount ConfigMaps or Secrets on a PersistentVolume.
  - This ensures that the ConfigMaps or Secrets are not mounted as symbolic links. Which some applications might not read.
1. Funnel allows a Kubernetes user to mount ConfigMaps to a specific Pod in a StatefulSet. See the HOSTNAME filter.
  - This feature does not exist in StatefulSets.
 
### Cons
1. **IMPORTANT!**: Updating a ConfigMap/Secret does not update the files funneled into a PersistentVolume!
  - Funnel does not watch files for changes. Which is why it runs as an initContainer rather than a container. It terminates as soon as its job is done.

## Usage
Funnel is to be used as an `init-container`. 

Volumes 'from' which files are to be conducted should be mounted in `/usr/src/app/from/`.
Volumes 'to' which files are to be conducted should be mounted in `/usr/src/app/to/`.

## Procedure
Funnel picks up **all** paths from `/usr/src/app/from/**` and maps them to `/usr/src/app/to/**`.
This means you can use sub-paths in `/usr/src/app/from/` and direct them to a specific sub-path in `/usr/src/app/to/`.
For example, `/usr/src/app/from/my-awesome-app-without-symlink-reading/` is mapped to `/usr/src/app/to/my-awesome-app-without-symlink-reading/`.
Then, a regular container can use the volume with mountPath `/usr/src/app/to/my-awesome-app-without-symlink-reading/`.

## Options

### Filters
Version 1.1.0 introduced the ``FILTER_TYPE`` option. This option allows you to select a filter for funnel.
The filter-types are:
- NONE      (default)
- HOSTNAME

#### None filter
This is the default filter for funnel. When enabled funnel does not filter the data mounted in ``usr/src/app/from``.

#### Hostname filter
The hostname filter was made with StatefulSets in mind. The way StatefulSets are designed makes it difficult to provide each individual pod with configuration.
To solve this problem the hostname filter walks the ``./from`` directory and filters any paths that do not match the following glob: `**/HOSTNAME/**`. 
Where ``HOSTNAME`` is retrieved by funnel and represent a pod's hostname. For StatefulSets the hostname would be `$(statefulset name)-$(ordinal)`. 
Check the [Kubernetes StatefulSet documentation](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#pod-identity) for more information on pod naming.

### Logging
By default only errors funnel only logs errors. However should you want to know if the copying of a file was done correctly you can specify a LOG_LEVEL.
The LOG_LEVEL options are:
- DEBUG
- ERROR

### Encoding
Funnel uses NodeJS to read and write files. This means that it's default encoding is ``utf-8``. 
Currently there are no plans to support other encodings.

## Trivia
- When moving a liquid from one container to another container one often uses a funnel so the liquid does not spill.
- Funneling is a term used for the allocation of a resource. For instance, 'The company was funneling all income towards the R&D department.'.
- Volume is the quantity of three-dimensional space enclosed by a closed surface. Closed surfaces are otherwise known as containers.

## Examples

### Base usage
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

#### Secret to PersistentVolume
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
        env:
          - name: LOG_LEVEL
            value: DEBUG
        volumeMounts:
        - mountPath: /usr/src/app/from/
          name: secret-volume
          readOnly: true
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
      - name: secret-volume
        secret:
          secretName: super-secret-secret
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

---
apiVersion: v1
kind: Secret
metadata:
  name: super-secret-secret
type: Opaque
data:
  base64.txt: "bWFueSA2NCBzdWNoIGJhc2Ugd293"

````

### Filters

#### Hostname filter
The example below show how to use the hostname filter in a StatefulSet.
````yaml
apiVersion: v1
data:
  content.json: |
    {
    such: "content",
    many: "amaze"
    }
kind: ConfigMap
metadata:
  name: from-config-0-0
---

apiVersion: v1
data:
  content.json: |
    Helloooo?
kind: ConfigMap
metadata:
  name: from-config-0-1
---

apiVersion: v1
data:
  content.txt: |
    Wait.. I feel I've been conducted.. BUT! IT CAN'T BE!
kind: ConfigMap
metadata:
  name: from-config-1-0
---

apiVersion: v1
data:
  content.txt: |
    I must have called a thousand times!!
kind: ConfigMap
metadata:
  name: from-config-1-1
---

apiVersion: v1
kind: Service
metadata:
  name: funnel
  labels:
    app: funnel
spec:
  ports:
  clusterIP: None
  selector:
    app: funnel
---
# NOTE: The StatefulSet will crash because the busybox container terminates after executing a command.
# The container you put in place of busybox should not terminate unless an error occurs.

apiVersion: apps/v1beta1
kind: StatefulSet
metadata:
  name: hostname
spec:
  serviceName: "funnel"
  podManagementPolicy: "Parallel"
  replicas: 2
  selector:
    matchLabels:
      app: funnel
  template:
    metadata:
      labels:
        app: funnel
    spec:
      initContainers:
      - name: funnel
        image: robertdiebels/funnel:nightly
        imagePullPolicy: "Always"
        env:
        - name: "FILTER_TYPE"
          value: "HOST_NAME"
        volumeMounts:
        - mountPath: /usr/src/app/from/hostname-0
          name: hostname-0-volume-0
        - mountPath: /usr/src/app/from/is-it-me-youre-looking-for
          name: hostname-0-volume-1
        - mountPath: /usr/src/app/from/pendant/hostname-1
          name: hostname-1-volume-0
        - mountPath: /usr/src/app/from/hello-how-are-you
          name: hostname-1-volume-1
        - mountPath: /usr/src/app/to/
          name: persistent-volume
      containers:
      - name: myapp-container
        image: busybox
        # NOTE: If you've used this example more than once and you've changed the mountPaths before. It may be that you see more folders than in this example.
        # Be sure to delete the persistentVolumes bound to the volumeClaimTemplates defined below and the volumeClaimTemplate themselves when you give this example several tries.
        command: ['sh', '-c','export HOST_NAME=`hostname`; echo "Should only allow files from directories named:" $HOST_NAME; echo "So, there should be something below this sentence"; ls /opt/share/config; ls /opt/share/config/pendant; echo "And, there should be nothing below this sentence."; ls -lR /opt/share/config | grep ^l']
        volumeMounts:
        - mountPath: /opt/share/config
          name: persistent-volume
      volumes:
      - name: hostname-0-volume-0
        configMap:
          name: from-config-0-0
      - name: hostname-0-volume-1
        configMap:
          name: from-config-0-0
      - name: hostname-1-volume-0
        configMap:
          name: from-config-1-0
      - name: hostname-1-volume-1
        configMap:
          name: from-config-1-1
  volumeClaimTemplates:
  - metadata:
      name: persistent-volume
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: standard
      resources:
        requests:
          storage: 10Mi
````

### Logging
This example shows how to enable the LOG_LEVEL DEBUG in funnel.
````yaml
initContainers:
  - name: funnel
    image: robertdiebels/funnel
    env:
    - name: LOG_LEVEL
      value: "DEBUG"
    volumeMounts:
    - mountPath: /usr/src/app/from/
      name: configmap-volume
    - mountPath: /usr/src/app/to/
      name: persistent-volume
      subPath: /away/from/root/we/go/
````