package com.alexliu07.classtimetable

import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.room.Room
import com.alexliu07.classtimetable.ui.theme.ClassTimetableTheme
import com.google.android.gms.wearable.DataMap
import com.google.android.gms.wearable.PutDataMapRequest
import kotlinx.coroutines.launch
import me.chenhe.lib.wearmsger.DataHub
import org.yaml.snakeyaml.Yaml
import java.time.LocalTime


class MainActivity : ComponentActivity() {

    lateinit var db : AppDatabase
    lateinit var dataDao: DataDao

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        db = Room.databaseBuilder(applicationContext,AppDatabase::class.java,"data").allowMainThreadQueries().build()
        dataDao = db.dataDao()
        setContent {
            ClassTimetableTheme {
                Scaffold(
                    topBar = {
                        TopAppBar(
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = MaterialTheme.colorScheme.inversePrimary,
                                titleContentColor = MaterialTheme.colorScheme.primary
                            ),
                            title = {
                                Text(
                                    text = stringResource(R.string.app_name),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        )
                    }
                ) { innerPadding ->
                    MainApp(modifier = Modifier.padding(innerPadding),)
                }
            }
        }
    }
    @Composable
    fun MainApp(modifier: Modifier = Modifier) {
        val showDialog = remember{ mutableStateOf(false)}
        val selectedUri = remember{ mutableStateOf<Uri?>(null)}
        val launcher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){uri: Uri?->selectedUri.value = uri}
        Column(
            modifier = modifier
        ){
            Button(
                onClick = {
                    if(!dataDao.isEmpty())showDialog.value = true
                    else launcher.launch(arrayOf("application/yaml"))
                },
                modifier = Modifier.padding(top = 10.dp, start = 10.dp)
            ){ Text(stringResource(R.string.import_timetable))}
        }

        if(showDialog.value){
            AlertDialog(
                onDismissRequest = {showDialog.value = false},
                confirmButton = { TextButton(onClick = {
                    showDialog.value = false
                    launcher.launch(arrayOf("application/yaml"))
                }) { Text(stringResource(R.string.confirm)) } },
                dismissButton = { TextButton(onClick = {showDialog.value = false}) { Text(stringResource(
                    R.string.cancel)) }},
                title = { Text(stringResource(R.string.timetable_already_exists)) },
                text = {Text(stringResource(R.string.overwrite_data))}
            )
        }
        selectedUri.value?.let {uri->
            parseSaveCSES(uri)
            selectedUri.value = null
        }

    }
    fun parseSaveCSES(uri: Uri){
        val contentResolver = this.contentResolver
        val inputStream = contentResolver.openInputStream(uri)
        val yaml = Yaml()
        val data = yaml.load<Map<String,Any>>(inputStream)
        emptyDB(dataDao)
//    val timetable = mutableListOf<MutableList<Data>>()
        val schedules = data["schedules"] as ArrayList<*>
//    for (i in 0..6)timetable.add(mutableListOf())
        for (i in 0..<schedules.size){
            val tempSchedule = schedules[i] as LinkedHashMap<*, *>
            val day = tempSchedule["enable_day"] as Int
            val classes = tempSchedule["classes"] as ArrayList<*>
            for(j in 0..<classes.size){
                val tempClassInfo = classes[j] as LinkedHashMap<*, *>
                val startTimeString = tempClassInfo["start_time"] as String
                val startTime = LocalTime.parse(startTimeString)
                val endTimeString = tempClassInfo["end_time"] as String
                val endTime = LocalTime.parse(endTimeString)
                val classData = Data(day=day-1, subject = tempClassInfo["subject"] as String, startTime = startTime, endTime = endTime)
//            timetable[day-1].add(classData)
                dataDao.insert(classData)
            }
        }
        transferData()
        Toast.makeText(this,this.getString(R.string.import_success),Toast.LENGTH_SHORT).show()
//    for (i in 0..6)timetable[i].sortBy({it.startTime})
    }

    fun transferData(){
        val context = this
        lifecycleScope.launch {
            DataHub.deleteData(context,"/import")
            PutDataMapRequest.create("/import").setUrgent().let { request ->
                request.dataMap.run {
                    val allData = dataDao.getAll()
                    val dataMaps = arrayListOf<DataMap>()
                    for(data in allData){
                        val tempDataMap = DataMap()
                        tempDataMap.putInt("day",data.day)
                        tempDataMap.putString("subject",data.subject)
                        tempDataMap.putString("startTime",data.startTime.toString())
                        tempDataMap.putString("endTime",data.endTime.toString())
                        dataMaps.add(tempDataMap)
                    }
                    putDataMapArrayList("data",dataMaps)
                }
                DataHub.putData(context,request)
            }
        }
    }
}