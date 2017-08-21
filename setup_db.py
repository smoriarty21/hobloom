import os
import os.path
import shutil
import json
import sqlite3

GPIO_PINS = [
    'P9_12',
    'P9_23',
    'P9_25',
    'P9_27',
    'P9_30',
    'P9_41',
    'P8_7',
    'P8_8',
    'P8_9',
    'P8_10',
    'P8_11',
    'P8_12',
    'P8_14',
    'P8_15',
    'P8_16',
    'P8_17',
    'P8_18',
    'P8_26'
]

CONFIG_FILE_NAME = 'default.json'
CONFIG_FILE_PATH = 'config/'

dbPath = "{0}/hobloom.db".format(str(os.getcwd()))

def checkConfigFile(configFilePath):
    configExists = os.path.isfile(configFilePath)
    if not configExists:
        print "Config file not found generating now"
        shutil.copy("{0}.template".format(configFilePath), configFilePath)

        with open(configFilePath, 'r') as f:
            data = json.load(f)
            data['database'] = dbPath
        os.remove(configFilePath)
        with open(configFilePath, 'w') as f:
            json.dump(data, f, indent=4)
        print "Config file generation complete"
        return
    print 'Config file found!'

def createDatabase():
    print dbPath
    dbExists = os.path.isfile(dbPath)
    if dbExists:
        print "The database file already exists.  Would you like to delete it and create a fresh database?[Y/n]"
        dbReset = raw_input()
        if (dbReset.lower() == 'y'):
            print 'Deleting old database'
            os.remove(dbPath)
        else:
            print 'It looks like we are all done here'
            return
    print "Creating database"
    setupDatabase()

def setupDatabase():
    conn = sqlite3.connect(dbPath)
    print 'Database created'
    c = conn.cursor()
    print 'Creating assets table'
    c.execute("create table assets(id integer primary key autoincrement, name varchar(50), type varchar(50), pin varchar(8), deleted int not null default 0)")
    print 'Creating log tables'
    c.execute("create table temp_log(id integer primary key autoincrement, temperature varchar(50), humidity varchar(50), timestamp timestamp)")
    c.execute("create table appliance_log (appliance_id int not null, running varchar(10) not null, time timestamp not null)")
    print 'Creating settings table'
    c.execute("create table settings (key varchar(50), value varchar(50))")
    print "Seeding Data. Please answer the following questions to configure your system for use."
    print "Is your temperature and humidity sensor a dht11 or dht22?[dht11/dht22]"
    sensorType = raw_input()
    while not sensorType == 'dht11' and not sensorType == 'dht22':
        print 'Invalid value. Please enter either the value "dht11" or "dht22".'
        sensorType = raw_input()
    print "Please enter the pin your temperature and humidity sensor is connected too. Example values would be 'P8_7' or 'P9_10'.  If you are unsure of what pin you have connected your sensor too check out the diagram here: http://beagleboard.org/static/images/cape-headers.png"
    sensorPin = raw_input()
    while not sensorPin in GPIO_PINS:
        print 'Invalid value. Please enter either a valid pin number.  Please make sure to enter the pin exactly as the examples shown below.'
        sensorPin = raw_input()
    c.execute("INSERT INTO assets (`name`, `type`, `pin`) VALUES ('temp', '{0}', '{1}')".format(sensorType, sensorPin))
    print "Seeding base settings into system"
    c.execute("INSERT INTO settings (key, value) VALUES ('MIN_HUMIDITY', '60'), ('MAX_HUMIDITY', '70'), ('MAX_HEAT', '70'), ('MIN_HEAT', '50'), ('CONTROL_HUMIDITY', 'true'), ('CONTROL_HEAT', 'true'), ('START_DAY', '8'), ('END_DAY', '20')")

    print 'Wrapping up and closing database'
    conn.commit()
    conn.close()


def main():
    checkConfigFile("{0}{1}".format(CONFIG_FILE_PATH, CONFIG_FILE_NAME))
    createDatabase()

if __name__ == '__main__':
    main()