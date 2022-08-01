<?php
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    
    //if (isset($_COOKIE['id']) || isset($_SESSION['id'])) {
    if (true) {

        $userID;
        $response;

        if (isset($_COOKIE['id'])) {
            $userID = $_COOKIE['id'];
        }else{
            //$userID = $_SESSION['id'];
            $userID = 1;
        }

        require "bd-start.php";

        $result = $mysqli->query("SELECT
        notes.id, notes.title, notes.start_date, notes.end_date, notes.color,
        customer.name AS customer, performer.name AS performer
        FROM `notes`
        LEFT JOIN users AS customer ON notes.customer = customer.id
        LEFT JOIN users AS performer ON notes.performer = performer.id
        WHERE (customer.id = $userID OR performer.id = $userID) AND 
        (notes.start_date < '".$endDate."' AND notes.end_date > '".$startDate."')
        ORDER BY notes.id DESC");

        if($result) {
            $data = [];
            while($dat = mysqli_fetch_array($result)) {
                $data[] = $dat;
            }
            $response['data'] = $data;
            $response['success'] = 'OK';
        }else{
            $response['error'] = 'Данные не найдены!';
        }

        require "bd-end.php";

    }else{
        $response[error] = 'Вы не авторизованны, 
        авторизуйтесь для отображения заметок!';
    }
    
    header('Content-Type: application/json');
    $response = json_encode ($response, JSON_UNESCAPED_UNICODE);
    echo $response;
    ?>