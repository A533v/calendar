<?php
  $title = $_POST['title'];
  $customer = $_POST['customer'];
  $performer = $_POST['performer'];
  $start_date = $_POST['start_date'];
  $end_date = $_POST['end_date'];
  $color = $_POST['color'];
    
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

        $customer = mysqli_fetch_array($mysqli->query("SELECT users.id FROM `users`
            WHERE users.name = '$customer'"));

        $performer = mysqli_fetch_array($mysqli->query("SELECT users.id FROM `users`
            WHERE users.name = '$performer'"));

        if(!isset($customer)) {
            $response['error'] = 'Заказчик не найден в системе!';
        }else if(!isset($performer)) {
            $response['error'] = 'Исполнитель не найден в системе!';
        }else{
            $result = $mysqli->query("INSERT INTO `notes` (`title`, `start_date`, `end_date`, `color`, `customer`, `performer`) 
            VALUES ('$title', '$start_date', '$end_date', '$color', $customer[id], $performer[id])");
            $response['success'] = 'Заметка ' . $title . ' добавлена!';
        }

        require "bd-end.php";
    }else{
        $response['error'] = 'Вы не авторизованны, 
        авторизуйтесь для добавления заметок!';
    }
    
    header('Content-Type: application/json');
    $response = json_encode ($response, JSON_UNESCAPED_UNICODE);
    echo $response;
    ?>