var connected_flag = 0
var mqtt;
var reconnectTimeout = 2000;

var tempchart = 0;
var humichart = 0;


MQTTconnect();

function onConnectionLost() {
    connected_flag = 0;
    console.log('Reconnecting...');
    MQTTconnect();
}

function onFailure(message) {
    setTimeout(MQTTconnect, reconnectTimeout);
}

function onMessageArrived(r_message) {
    out_msg = "Message received " + r_message.payloadString + "<br>";
    out_msg = out_msg + "Message received Topic " + r_message.destinationName;

    console.log(out_msg);
    document.getElementById("arrived").innerHTML = out_msg;

    const obj = JSON.parse(r_message.payloadString);
    console.log(obj);
    var temp = obj.suhu;
    var humi = obj.kelembaban;
    var asap = obj.asap;

    tempchart = temp;
    humichart = humi;

    document.getElementById("suhu").innerHTML = (temp);
    document.getElementById("humi").innerHTML = (humi);
    document.getElementById("asap").innerHTML = (asap);

}

function onConnected(recon, url) {
    console.log(" in onConnected " + recon);
}

function onConnect() {
    connected_flag = 1

    console.log('Connected');
    sub_topics();
}

function MQTTconnect() {

    var s = "broker.hivemq.com";
    var p = 8000;

    if (p != "") {
        port = parseInt(p);
    }
    if (s != "") {
        host = s;
    }

    console.log('Connecting ...');

    var x = Math.floor(Math.random() * 10000);
    var cname = "orderform-" + x;
    mqtt = new Paho.MQTT.Client(host, port, cname);
    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure,

    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;

    mqtt.connect(options);
    return false;


}

function sub_topics() {
    if (connected_flag == 0) {
        out_msg = "<b>Not Connected so can't subscribe</b>"
        console.log(out_msg);
        return false;
    }
    var stopic = 'outSiapaTauKitaCoba'; //publish
    mqtt.subscribe(stopic);

    return false;
}

var msg = '0';

function send_message(command, aksi) {

    if (connected_flag == 0) {
        out_msg = "<b>Not Connected so can't send</b>"
        return false;
    }
    if (msg == '0') {
        msg = '1'
    } else {
        msg = '0';
    }

    s_msg = '{"respon":"' + command + '", "aksi":"' + aksi + '"}';

    console.log(msg);

    var topic = 'inSiapaTauKitaCoba'; //subscribe
    message = new Paho.MQTT.Message(s_msg);
    if (topic == "")
        message.destinationName = "inSiapaTauKitaCoba";
    else
        message.destinationName = topic;
    mqtt.send(message);
    return false;
}

function ledState(state) {
    if (state == 1) { message = new Paho.MQTT.Message("#on"); }
    if (state == 0) { message = new Paho.MQTT.Message("#off"); }
    message.destinationName = "inSiapaTauKitaCoba"; //subscribe
    mqtt.send(message);
}

google.charts.load('current', { 'packages': ['gauge'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Temperature', 80],
        ['Humidity', 100]
    ]);

    var options = {
        width: 600, height: 220,
        redFrom: 50, redTo: 100,
        yellowFrom: 35, yellowTo: 80,
        minorTicks: 5
    };

    var chart = new google.visualization.Gauge(document.getElementById('chart_div'));
    -
        chart.draw(data, options);

    setInterval(function () {
        data.setValue(0, 1, 0 + tempchart);
        chart.draw(data, options);
    }, 5000);
    setInterval(function () {
        data.setValue(1, 1, 0 + humichart);
    }, 5000);
}

