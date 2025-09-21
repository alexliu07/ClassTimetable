package com.alexliu07.classtimetable.complication

import android.app.ActivityOptions
import android.app.PendingIntent
import android.content.ComponentName
import android.content.Intent
import android.graphics.drawable.Icon
import android.os.Build
import android.util.Log
import androidx.room.Room
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.MonochromaticImage
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.alexliu07.classtimetable.AppDatabase
import com.alexliu07.classtimetable.CurrentInfo
import com.alexliu07.classtimetable.R
import com.alexliu07.classtimetable.getCurrentInfo
import com.alexliu07.classtimetable.presentation.MainActivity

/**
 * Skeleton for complication data source that returns short text.
 */
class MainComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        val tempData = CurrentInfo(5,this.getString(R.string.complication_example),"example",1200,2400)
        return createComplicationData(tempData)
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        val db = Room.databaseBuilder(applicationContext, AppDatabase::class.java,"data").allowMainThreadQueries().build()
        val dataDao = db.dataDao()
        val currentInfo = getCurrentInfo(dataDao)
        db.close()
        val workManager = WorkManager.getInstance(this)
        val workers = workManager.getWorkInfosByTag("updateComplication")
        var isRunning = false
        for (worker in workers.get()){
            Log.i("complication",worker.toString())
            if(worker.state == WorkInfo.State.RUNNING)isRunning = true
        }
        if(currentInfo.status == 0 && isRunning){
            Log.i("complication","cancel worker")
            workManager.cancelAllWorkByTag("updateComplication")
        }
        if(!isRunning && currentInfo.status != 0 && currentInfo.status != 5){
            Log.i("complication","start worker")
            workManager.cancelAllWorkByTag("updateComplication")
            val updateComplicationWorker = OneTimeWorkRequestBuilder<UpdateComplicationWorker>().addTag("updateComplication").build()
            workManager.enqueue(updateComplicationWorker)
        }
        return createComplicationData(currentInfo)
    }

    private fun createComplicationData(currentInfo: CurrentInfo): RangedValueComplicationData {
        Log.i("complication",currentInfo.toString())
        val nowIcon = MonochromaticImage.Builder(Icon.createWithResource(this,R.drawable.ic_now_icon)).build()
        val nextIcon = MonochromaticImage.Builder(Icon.createWithResource(this,R.drawable.ic_next_icon)).build()
        val complicationData = when (currentInfo.status){
            0 -> RangedValueComplicationData.Builder(
                value = 0f,
                min = 0f,
                max = 0f,
                contentDescription = PlainComplicationText.Builder(this.getString(R.string.complication_no_schedule)).build()
            )
                .setText(PlainComplicationText.Builder(this.getString(R.string.complication_no_schedule)).build())
            1 -> RangedValueComplicationData.Builder(
                value = 0f,
                min = 0f,
                max = 0f,
                contentDescription = PlainComplicationText.Builder(currentInfo.next).build()
            )
                .setText(PlainComplicationText.Builder(currentInfo.next).build())
                .setMonochromaticImage(nextIcon)
            2 -> RangedValueComplicationData.Builder(
                value = currentInfo.progress.toFloat(),
                min = 0f,
                max = currentInfo.total.toFloat(),
                contentDescription = PlainComplicationText.Builder(currentInfo.next).build()
            )
                .setText(PlainComplicationText.Builder(currentInfo.next).build())
                .setMonochromaticImage(nextIcon)
            3,4,5 -> RangedValueComplicationData.Builder(
                value = currentInfo.progress.toFloat(),
                min = 0f,
                max = currentInfo.total.toFloat(),
                contentDescription = PlainComplicationText.Builder(currentInfo.current).build()
            )
                .setText(PlainComplicationText.Builder(currentInfo.current).build())
                .setMonochromaticImage(nowIcon)
            else -> RangedValueComplicationData.Builder(
                value = 0f,
                min = 0f,
                max = 0f,
                contentDescription = PlainComplicationText.Builder(this.getString(R.string.complication_error)).build()
            )
                .setText(PlainComplicationText.Builder(this.getString(R.string.complication_error)).build())
        }
        val intent = Intent(this, MainActivity::class.java).apply {
            component = ComponentName(this@MainComplicationService, MainActivity::class.java)
        }
        val options = when{
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA -> ActivityOptions.makeBasic().setPendingIntentCreatorBackgroundActivityStartMode (ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOW_ALWAYS)
            Build.VERSION.SDK_INT in Build.VERSION_CODES.UPSIDE_DOWN_CAKE..Build.VERSION_CODES.VANILLA_ICE_CREAM -> ActivityOptions.makeBasic().setPendingIntentCreatorBackgroundActivityStartMode (ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED)
            else -> ActivityOptions.makeBasic()
        }.toBundle()
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_MUTABLE,options)
        return complicationData.setTapAction(pendingIntent).build()
    }

}